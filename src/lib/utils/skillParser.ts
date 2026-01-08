import type { SkillMetadata } from "@lib/types";

/**
 * Parse SKILL.md content and extract YAML frontmatter metadata
 * 
 * SKILL.md format:
 * ---
 * name: skill-name
 * description: What this skill does
 * allowed-tools: Read, Write, Bash
 * ---
 * 
 * # Skill Instructions
 * Markdown content...
 */
export function parseSkillMd(content: string): SkillMetadata {
  const defaultMetadata: SkillMetadata = {
    name: "",
    description: "",
  };

  if (!content || typeof content !== "string") {
    return defaultMetadata;
  }

  // Check for YAML frontmatter (between --- markers)
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    // Try to extract name from first heading if no frontmatter
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return {
        ...defaultMetadata,
        name: headingMatch[1].trim(),
      };
    }
    return defaultMetadata;
  }

  const yamlContent = frontmatterMatch[1];
  const metadata: SkillMetadata = { ...defaultMetadata };

  // Parse YAML-like content line by line
  const lines = yamlContent.split("\n");
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    // Match key: value pattern
    const match = trimmedLine.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/-/g, "_");
      let value: string | string[] = match[2].trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle special keys
      if (key === "allowed_tools" || key === "allowedtools" || key === "allowed-tools") {
        // Parse comma-separated tools
        metadata.allowedTools = value.split(",").map((t) => t.trim()).filter(Boolean);
      } else if (key === "skills") {
        // Parse comma-separated skills for subagents
        metadata.skills = value.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (key === "name") {
        metadata.name = value;
      } else if (key === "description") {
        metadata.description = value;
      } else {
        // Store other metadata as-is
        (metadata as Record<string, unknown>)[key] = value;
      }
    }
  }

  return metadata;
}

/**
 * Extract the markdown content (everything after frontmatter)
 */
export function extractSkillContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  return withoutFrontmatter.trim();
}

/**
 * Generate SKILL.md content from metadata and markdown
 */
export function generateSkillMd(metadata: SkillMetadata, markdownContent: string): string {
  const lines: string[] = ["---"];

  if (metadata.name) {
    lines.push(`name: ${metadata.name}`);
  }
  if (metadata.description) {
    lines.push(`description: ${metadata.description}`);
  }
  if (metadata.allowedTools && metadata.allowedTools.length > 0) {
    lines.push(`allowed-tools: ${metadata.allowedTools.join(", ")}`);
  }
  if (metadata.skills && metadata.skills.length > 0) {
    lines.push(`skills: ${metadata.skills.join(", ")}`);
  }

  // Add other custom metadata
  for (const [key, value] of Object.entries(metadata)) {
    if (!["name", "description", "allowedTools", "skills"].includes(key)) {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(markdownContent);

  return lines.join("\n");
}

/**
 * Validate SKILL.md content
 */
export function validateSkillMd(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content || typeof content !== "string") {
    errors.push("Content is empty or invalid");
    return { valid: false, errors };
  }

  // Check for frontmatter
  if (!content.startsWith("---")) {
    errors.push("SKILL.md should start with YAML frontmatter (---)");
  }

  const metadata = parseSkillMd(content);

  if (!metadata.name) {
    errors.push("Missing required field: name");
  }

  if (!metadata.description) {
    errors.push("Missing required field: description");
  }

  // Check for closing frontmatter
  const frontmatterCount = (content.match(/^---$/gm) || []).length;
  if (frontmatterCount < 2) {
    errors.push("Frontmatter must have opening and closing --- markers");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Format SKILL.md for display (syntax highlighting hints)
 */
export interface SkillMdSection {
  type: "frontmatter" | "heading" | "code" | "text";
  content: string;
  startLine: number;
  endLine: number;
}

export function parseSkillMdSections(content: string): SkillMdSection[] {
  const sections: SkillMdSection[] = [];
  const lines = content.split("\n");
  
  let currentSection: SkillMdSection | null = null;
  let inFrontmatter = false;
  let inCodeBlock = false;
  let frontmatterStart = -1;

  lines.forEach((line, index) => {
    if (line.trim() === "---") {
      if (!inFrontmatter && frontmatterStart === -1) {
        inFrontmatter = true;
        frontmatterStart = index;
      } else if (inFrontmatter) {
        sections.push({
          type: "frontmatter",
          content: lines.slice(frontmatterStart, index + 1).join("\n"),
          startLine: frontmatterStart,
          endLine: index,
        });
        inFrontmatter = false;
      }
      return;
    }

    if (inFrontmatter) return;

    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        currentSection = {
          type: "code",
          content: line,
          startLine: index,
          endLine: index,
        };
      } else {
        if (currentSection) {
          currentSection.content += "\n" + line;
          currentSection.endLine = index;
          sections.push(currentSection);
        }
        inCodeBlock = false;
        currentSection = null;
      }
      return;
    }

    if (inCodeBlock && currentSection) {
      currentSection.content += "\n" + line;
      currentSection.endLine = index;
      return;
    }

    if (line.startsWith("#")) {
      sections.push({
        type: "heading",
        content: line,
        startLine: index,
        endLine: index,
      });
    }
  });

  return sections;
}


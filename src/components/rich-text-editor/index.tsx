"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Extension } from "@tiptap/core";
import MenuBar from "./menu-bar";
import "./editor-styles.css";
import {
  Bold,
  Code,
  CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Create a lowlight instance
const lowlight = createLowlight();

// Custom extension for keyboard shortcuts
const CustomKeyboardShortcuts = Extension.create({
  name: "customKeyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      "Mod-k": ({ editor }) => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
          return false;
        }

        // empty
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return true;
        }

        // update link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();

        return true;
      },
    } as const;
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing or paste content here...",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Monitor scroll to add sticky class to toolbar
  useEffect(() => {
    const handleScroll = () => {
      const toolbarEl = document.querySelector(".editor-toolbar");
      if (!toolbarEl) return;

      const rect = toolbarEl.getBoundingClientRect();
      setIsSticky(rect.top <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-4",
          },
        },
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "editor-table",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      Superscript,
      Subscript,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "code-block rounded-md overflow-hidden",
        },
      }),
      CustomKeyboardShortcuts,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] prose prose-sm sm:prose max-w-none focus:outline-none bg-white dark:bg-slate-900",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Apply sticky class to toolbar
  useEffect(() => {
    const toolbarEl = document.querySelector(".editor-toolbar");
    if (toolbarEl) {
      if (isSticky) {
        toolbarEl.classList.add("is-sticky");
      } else {
        toolbarEl.classList.remove("is-sticky");
      }
    }
  }, [isSticky]);

  const handleLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      // Check if a URL protocol is given, if not add https://
      const url = /^https?:\/\//i.test(linkUrl)
        ? linkUrl
        : `https://${linkUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setLinkUrl("");
      setIsLinkOpen(false);
    } else if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor, linkUrl]);

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
  };

  return (
    <div className="editor-wrapper">
      <MenuBar editor={editor} />

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 150,
            placement: "top",
          }}
          className="bubble-menu bg-white dark:bg-gray-900 border shadow-lg rounded-md p-1 flex items-center gap-1"
        >
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200 editor-shortcut-tooltip"
            )}
            data-shortcut="Ctrl+B"
          >
            <Bold className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            data-shortcut="Ctrl+I"
          >
            <Italic className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            title="Underline (Ctrl+U)"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200 editor-shortcut-tooltip"
            )}
            data-shortcut="Ctrl+U"
          >
            <UnderlineIcon className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200"
            )}
          >
            <Strikethrough className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("highlight")}
            onPressedChange={() =>
              editor.chain().focus().toggleHighlight().run()
            }
            title="Highlight text"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200"
            )}
          >
            <Highlighter className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200"
            )}
          >
            <Code className="size-4" />
          </Toggle>

          <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <PopoverTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                title="Add link (Ctrl+K)"
                className={cn(
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  "transition-colors duration-200 editor-shortcut-tooltip"
                )}
                data-shortcut="Ctrl+K"
              >
                <LinkIcon className="size-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLink()}
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" onClick={handleLink}>
                    {editor.isActive("link") ? "Update" : "Add"} Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200"
            )}
          >
            <Heading1 className="size-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "transition-colors duration-200"
            )}
          >
            <Heading2 className="size-4" />
          </Toggle>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {showKeyboardShortcuts && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border text-sm">
          <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+B
                </kbd>{" "}
                Bold
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+I
                </kbd>{" "}
                Italic
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+U
                </kbd>{" "}
                Underline
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+K
                </kbd>{" "}
                Insert Link
              </div>
            </div>
            <div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+Z
                </kbd>{" "}
                Undo
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Ctrl+Y
                </kbd>{" "}
                Redo
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Tab
                </kbd>{" "}
                Indent
              </div>
              <div className="mb-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                  Shift+Tab
                </kbd>{" "}
                Outdent
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={toggleKeyboardShortcuts}
          >
            Close
          </Button>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={toggleKeyboardShortcuts}>
          {showKeyboardShortcuts ? "Hide" : "Show"} Keyboard Shortcuts
        </Button>
      </div>
    </div>
  );
}

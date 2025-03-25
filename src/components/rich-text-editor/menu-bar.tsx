import {
  AlignCenter,
  AlignLeft,
  AlignRight,
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
  Maximize,
  Minimize,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Table as TableIcon,
  Underline,
  Undo,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

type ToggleButtonProps = {
  icon: React.ReactNode;
  onClick: () => boolean | void;
  tooltip: string;
  pressed?: boolean;
  disabled?: boolean;
};

export default function MenuBar({ editor }: { editor: Editor | null }) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateWordCount = () => {
      const text = editor.getText();
      setWordCount({
        words: text.split(/\s+/).filter((word) => word.length > 0).length,
        characters: text.length,
      });
    };

    editor.on("update", updateWordCount);
    updateWordCount();

    return () => {
      editor.off("update", updateWordCount);
    };
  }, [editor]);

  // Fullscreen functionality
  useEffect(() => {
    if (!editorWrapperRef.current) return;

    const wrapper = editorWrapperRef.current.closest(".editor-wrapper");
    if (!wrapper) return;

    if (isFullscreen) {
      wrapper.classList.add("fullscreen-editor");
      document.body.style.overflow = "hidden";
    } else {
      wrapper.classList.remove("fullscreen-editor");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Set editor wrapper ref
  useEffect(() => {
    if (editor) {
      editorWrapperRef.current = editor.view.dom.parentElement;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const addImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          editor
            .chain()
            .focus()
            .setImage({ src: e.target.result as string })
            .run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      // Check if a URL protocol is given, if not add https://
      const url = /^https?:\/\//i.test(linkUrl)
        ? linkUrl
        : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
      setLinkUrl("");
      setIsLinkOpen(false);
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const createTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableSize.rows, cols: tableSize.cols })
      .run();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const TextButtons: ToggleButtonProps[] = [
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
      tooltip: "Bold (Ctrl+B)",
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
      tooltip: "Italic (Ctrl+I)",
    },
    {
      icon: <Underline className="size-4" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
      tooltip: "Underline (Ctrl+U)",
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
      tooltip: "Strikethrough",
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
      tooltip: "Highlight",
    },
    {
      icon: <Code className="size-4" />,
      onClick: () => editor.chain().focus().toggleCode().run(),
      pressed: editor.isActive("code"),
      tooltip: "Inline Code",
    },
    {
      icon: <Superscript className="size-4" />,
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
      pressed: editor.isActive("superscript"),
      tooltip: "Superscript",
    },
    {
      icon: <Subscript className="size-4" />,
      onClick: () => editor.chain().focus().toggleSubscript().run(),
      pressed: editor.isActive("subscript"),
      tooltip: "Subscript",
    },
  ];

  const HeadingButtons: ToggleButtonProps[] = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
      tooltip: "Heading 1",
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
      tooltip: "Heading 2",
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
      tooltip: "Heading 3",
    },
  ];

  const AlignmentButtons: ToggleButtonProps[] = [
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
      tooltip: "Align Left",
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
      tooltip: "Align Center",
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
      tooltip: "Align Right",
    },
  ];

  const ListButtons: ToggleButtonProps[] = [
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
      tooltip: "Bullet List",
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
      tooltip: "Ordered List",
    },
    {
      icon: <ListChecks className="size-4" />,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      pressed: editor.isActive("taskList"),
      tooltip: "Task List",
    },
  ];

  const HistoryButtons: ToggleButtonProps[] = [
    {
      icon: <Undo className="size-4" />,
      onClick: () => editor.chain().focus().undo().run(),
      tooltip: "Undo (Ctrl+Z)",
      disabled: !editor.can().undo(),
    },
    {
      icon: <Redo className="size-4" />,
      onClick: () => editor.chain().focus().redo().run(),
      tooltip: "Redo (Ctrl+Y)",
      disabled: !editor.can().redo(),
    },
    {
      icon: <RemoveFormatting className="size-4" />,
      onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      tooltip: "Clear Formatting",
    },
  ];

  return (
    <div className="editor-toolbar sticky top-0 z-10 bg-white dark:bg-gray-900 border rounded-md p-1 mb-1 flex flex-wrap gap-1 items-center">
      {/* History Options */}
      <div className="flex border-r pr-1 mr-1">
        {HistoryButtons.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            title={option.tooltip}
            disabled={option.disabled}
            size="sm"
            variant="outline"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
              "transition-colors duration-200"
            )}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>

      {/* Heading Options */}
      <div className="flex border-r pr-1 mr-1">
        {HeadingButtons.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            title={option.tooltip}
            size="sm"
            variant="outline"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
              "transition-colors duration-200"
            )}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>

      {/* Text Formatting Options */}
      <div className="flex border-r pr-1 mr-1">
        {TextButtons.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            title={option.tooltip}
            size="sm"
            variant="outline"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
              "transition-colors duration-200"
            )}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>

      {/* Alignment Options */}
      <div className="flex border-r pr-1 mr-1">
        {AlignmentButtons.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            title={option.tooltip}
            size="sm"
            variant="outline"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
              "transition-colors duration-200"
            )}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>

      {/* List Options */}
      <div className="flex border-r pr-1 mr-1">
        {ListButtons.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            title={option.tooltip}
            size="sm"
            variant="outline"
            className={cn(
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
              "transition-colors duration-200"
            )}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>

      {/* Link */}
      <div className="flex border-r pr-1 mr-1">
        <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <PopoverTrigger asChild>
            <Toggle
              pressed={editor.isActive("link")}
              title="Insert Link"
              size="sm"
              variant="outline"
              className={cn(
                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
                "transition-colors duration-200"
              )}
            >
              <LinkIcon className="size-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="space-y-2">
              <h4 className="font-medium">Insert Link</h4>
              <Input
                type="url"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLink()}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={addLink}>
                  {editor.isActive("link") ? "Update Link" : "Insert Link"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Code Block */}
      <div className="flex border-r pr-1 mr-1">
        <Toggle
          pressed={editor.isActive("codeBlock")}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
          size="sm"
          variant="outline"
          className={cn(
            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
            "transition-colors duration-200"
          )}
        >
          <CodeIcon className="size-4" />
        </Toggle>
      </div>

      {/* Image */}
      <div className="flex border-r pr-1 mr-1">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle
              title="Insert Image"
              size="sm"
              variant="outline"
              className={cn(
                "hover:bg-muted/60",
                "transition-colors duration-200"
              )}
            >
              <ImageIcon className="size-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="space-y-2">
              <h4 className="font-medium">Insert Image</h4>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={addImageFile}
              />
              <Input
                type="url"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
              />
              <div className="flex justify-between space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <Button size="sm" onClick={addImage}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="flex border-r pr-1 mr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Toggle
              title="Insert Table"
              size="sm"
              variant="outline"
              className={cn(
                editor.isActive("table") &&
                  "bg-primary text-primary-foreground",
                "hover:bg-muted/60",
                "transition-colors duration-200"
              )}
            >
              <TableIcon className="size-4" />
            </Toggle>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="p-2">
              <h4 className="font-medium mb-2">Insert Table</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="rows" className="text-xs">
                    Rows
                  </label>
                  <Input
                    id="rows"
                    type="number"
                    min="1"
                    value={tableSize.rows}
                    onChange={(e) =>
                      setTableSize({
                        ...tableSize,
                        rows: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="cols" className="text-xs">
                    Columns
                  </label>
                  <Input
                    id="cols"
                    type="number"
                    min="1"
                    value={tableSize.cols}
                    onChange={(e) =>
                      setTableSize({
                        ...tableSize,
                        cols: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <Button size="sm" className="mt-2 w-full" onClick={createTable}>
                Insert Table
              </Button>
            </div>
            <DropdownMenuSeparator />
            {editor.isActive("table") && (
              <>
                <DropdownMenuItem
                  onSelect={() =>
                    editor.chain().focus().addColumnBefore().run()
                  }
                >
                  Add Column Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().addColumnAfter().run()}
                >
                  Add Column After
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().deleteColumn().run()}
                >
                  Delete Column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().addRowBefore().run()}
                >
                  Add Row Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().addRowAfter().run()}
                >
                  Add Row After
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().deleteRow().run()}
                >
                  Delete Row
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => editor.chain().focus().deleteTable().run()}
                >
                  Delete Table
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fullscreen toggle */}
      <div className="flex">
        <Toggle
          pressed={isFullscreen}
          onPressedChange={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          size="sm"
          variant="outline"
          className={cn(
            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/60",
            "transition-colors duration-200"
          )}
        >
          {isFullscreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </Toggle>
      </div>

      {/* Word count */}
      <div className="ml-auto text-xs text-muted-foreground flex items-center">
        <span title="Word count">{wordCount.words} words</span>
        <span className="mx-1">•</span>
        <span title="Character count">{wordCount.characters} characters</span>
      </div>
    </div>
  );
}

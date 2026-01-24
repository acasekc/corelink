import React, { useEffect, useRef, useState, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode, $createLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $setBlocksType } from "@lexical/selection";
import {
  $getRoot,
  $insertNodes,
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  DecoratorNode,
  createCommand,
} from "lexical";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link,
  Undo,
  Redo,
  ImagePlus,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
} from "lucide-react";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

// Custom command for inserting images
export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

// Custom ImageNode for Lexical
class ImageNode extends DecoratorNode {
  __src;
  __altText;
  __width;
  __height;
  __alignment; // 'none', 'left', 'right'

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__alignment, node.__key);
  }

  constructor(src, altText = "", width = "auto", height = "auto", alignment = "none", key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__alignment = alignment;
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = "editor-image-container my-4";
    return div;
  }

  updateDOM() {
    return false;
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setAlignment(alignment) {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  static importJSON(serializedNode) {
    const { src, altText, width, height, alignment } = serializedNode;
    return $createImageNode({ src, altText, width, height, alignment });
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment,
    };
  }

  exportDOM() {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    if (this.__width !== "auto") {
      img.width = this.__width;
    }
    if (this.__height !== "auto") {
      img.height = this.__height;
    }
    // Add float alignment for text wrapping
    if (this.__alignment === "left") {
      img.style.float = "left";
      img.style.marginRight = "1rem";
      img.style.marginBottom = "0.5rem";
    } else if (this.__alignment === "right") {
      img.style.float = "right";
      img.style.marginLeft = "1rem";
      img.style.marginBottom = "0.5rem";
    }
    return { element: img };
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: (domNode) => {
          const src = domNode.getAttribute("src");
          const altText = domNode.getAttribute("alt") || "";
          const width = domNode.getAttribute("width") || "auto";
          const height = domNode.getAttribute("height") || "auto";
          // Parse float style for alignment
          const floatStyle = domNode.style?.float || "";
          let alignment = "none";
          if (floatStyle === "left") alignment = "left";
          else if (floatStyle === "right") alignment = "right";
          if (src) {
            return { node: $createImageNode({ src, altText, width, height, alignment }) };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  decorate() {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        alignment={this.__alignment}
        nodeKey={this.__key}
      />
    );
  }
}

// Helper function to create image nodes
function $createImageNode({ src, altText = "", width = "auto", height = "auto", alignment = "none" }) {
  return new ImageNode(src, altText, width, height, alignment);
}

// Resizable Image component rendered inside the editor
function ImageComponent({ src, altText, width, height, alignment, nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width === "auto" ? null : Number(width));
  const [currentHeight, setCurrentHeight] = useState(height === "auto" ? null : Number(height));
  const [currentAlignment, setCurrentAlignment] = useState(alignment || "none");
  
  // Use ref to track latest dimensions for the resize handler
  const dimensionsRef = useRef({ width: currentWidth, height: currentHeight });
  useEffect(() => {
    dimensionsRef.current = { width: currentWidth, height: currentHeight };
  }, [currentWidth, currentHeight]);

  // Handle alignment change
  const handleAlignmentChange = useCallback((newAlignment) => {
    setCurrentAlignment(newAlignment);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof ImageNode) {
        node.setAlignment(newAlignment);
      }
    });
  }, [editor, nodeKey]);

  // Handle click to select/deselect
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setIsSelected(true);
  }, []);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (imageRef.current && !imageRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle resize
  const handleResizeStart = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const img = imageRef.current?.querySelector("img");
    if (!img) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth, newHeight;

      if (direction.includes("e")) {
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (direction.includes("w")) {
        newWidth = Math.max(100, startWidth - deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (direction.includes("s")) {
        newHeight = Math.max(50, startHeight + deltaY);
        newWidth = newHeight * aspectRatio;
      } else if (direction.includes("n")) {
        newHeight = Math.max(50, startHeight - deltaY);
        newWidth = newHeight * aspectRatio;
      }

      // For corner handles, use the larger delta to maintain aspect ratio
      if (direction === "se" || direction === "nw") {
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
        newWidth = Math.max(100, startWidth + (direction === "se" ? delta : -delta));
        newHeight = newWidth / aspectRatio;
      } else if (direction === "sw" || direction === "ne") {
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY * aspectRatio;
        newWidth = Math.max(100, startWidth + (direction === "ne" ? delta : -delta));
        newHeight = newWidth / aspectRatio;
      }

      setCurrentWidth(Math.round(newWidth));
      setCurrentHeight(Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Update the node with new dimensions (use ref to get latest values)
      const { width: finalWidth, height: finalHeight } = dimensionsRef.current;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node && finalWidth && finalHeight && node instanceof ImageNode) {
          node.setWidthAndHeight(finalWidth, finalHeight);
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [editor, nodeKey]);

  // Get image dimensions on load if not set
  const handleImageLoad = useCallback((e) => {
    if (!currentWidth && !currentHeight) {
      const img = e.target;
      // Cap initial width at 600px
      const maxWidth = 600;
      if (img.naturalWidth > maxWidth) {
        const ratio = maxWidth / img.naturalWidth;
        setCurrentWidth(maxWidth);
        setCurrentHeight(Math.round(img.naturalHeight * ratio));
      }
    }
  }, [currentWidth, currentHeight]);

  // Get float style based on alignment
  const getFloatStyle = () => {
    if (currentAlignment === "left") {
      return { float: "left", marginRight: "1rem", marginBottom: "0.5rem" };
    } else if (currentAlignment === "right") {
      return { float: "right", marginLeft: "1rem", marginBottom: "0.5rem" };
    }
    return {};
  };

  return (
    <div
      ref={imageRef}
      className={`relative inline-block my-2 ${isSelected ? "ring-2 ring-cyan-500 ring-offset-2" : ""}`}
      onClick={handleClick}
      style={{ 
        cursor: isResizing ? "nwse-resize" : "pointer",
        ...getFloatStyle(),
      }}
    >
      <img
        src={src}
        alt={altText}
        className="block rounded-lg shadow-md"
        style={{
          width: currentWidth ? `${currentWidth}px` : "auto",
          height: currentHeight ? `${currentHeight}px` : "auto",
          maxWidth: "100%",
        }}
        onLoad={handleImageLoad}
        draggable={false}
      />
      
      {/* Alignment and resize controls - only shown when selected */}
      {isSelected && (
        <>
          {/* Alignment toolbar */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800 rounded-lg p-1 shadow-lg">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleAlignmentChange("left"); }}
              className={`p-1.5 rounded ${currentAlignment === "left" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
              title="Float Left (text wraps right)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="5" width="8" height="8" rx="1" />
                <path strokeLinecap="round" d="M14 7h7M14 11h7M3 17h18M3 21h18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleAlignmentChange("none"); }}
              className={`p-1.5 rounded ${currentAlignment === "none" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
              title="Inline (no float)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="8" width="12" height="8" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleAlignmentChange("right"); }}
              className={`p-1.5 rounded ${currentAlignment === "right" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
              title="Float Right (text wraps left)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="13" y="5" width="8" height="8" rx="1" />
                <path strokeLinecap="round" d="M3 7h7M3 11h7M3 17h18M3 21h18" />
              </svg>
            </button>
          </div>

          {/* Corner handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          
          {/* Edge handles */}
          <div
            className="absolute top-1/2 -left-1 w-2 h-6 -translate-y-1/2 bg-cyan-500 border border-white rounded-sm cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute top-1/2 -right-1 w-2 h-6 -translate-y-1/2 bg-cyan-500 border border-white rounded-sm cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div
            className="absolute -top-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-cyan-500 border border-white rounded-sm cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute -bottom-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-cyan-500 border border-white rounded-sm cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          
          {/* Size indicator */}
          {currentWidth && currentHeight && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap">
              {currentWidth} × {currentHeight}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Image Plugin to handle image insertion
function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const { src, altText } = payload;
        const imageNode = $createImageNode({ src, altText });
        $insertNodes([imageNode]);
        
        // Insert a paragraph after the image for continued editing
        const paragraphNode = $createParagraphNode();
        imageNode.insertAfter(paragraphNode);
        paragraphNode.select();
        
        return true;
      },
      0
    );
  }, [editor]);

  return null;
}

const theme = {
  ltr: "text-left",
  rtl: "text-right",
  paragraph: "mb-2 text-slate-900",
  quote: "border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4",
  heading: {
    h1: "text-3xl font-bold mb-4 text-slate-900",
    h2: "text-2xl font-bold mb-3 text-slate-900",
    h3: "text-xl font-bold mb-2 text-slate-900",
    h4: "text-lg font-bold mb-2 text-slate-900",
    h5: "text-base font-bold mb-2 text-slate-900",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal ml-6 mb-4 text-slate-900",
    ul: "list-disc ml-6 mb-4 text-slate-900",
    listitem: "mb-1",
  },
  link: "text-cyan-600 hover:underline cursor-pointer",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-slate-100 px-1 py-0.5 rounded font-mono text-sm text-slate-900",
  },
  code: "bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm block my-4 overflow-x-auto",
  image: "my-4 rounded-lg",
};

// Toolbar Button Component
const ToolbarButton = ({ icon: Icon, onClick, isActive, title, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded hover:bg-slate-200 transition-colors ${
      isActive ? "bg-slate-200 text-cyan-600" : "text-slate-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    title={title}
  >
    <Icon className={`w-4 h-4 ${disabled ? "animate-spin" : ""}`} />
  </button>
);

// Toolbar Divider
const ToolbarDivider = () => (
  <div className="w-px h-6 bg-slate-300 mx-1" />
);

// Toolbar Plugin
function ToolbarPlugin({ onImageUpload, featuredImage }) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertList = (type) => {
    if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatHeading = (headingType) => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        $setBlocksType(sel, () => $createHeadingNode(headingType));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        $setBlocksType(sel, () => $createQuoteNode());
      }
    });
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(url);
          selection.insertNodes([linkNode]);
        }
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const insertFeaturedImage = () => {
    if (!featuredImage) {
      alert("No featured image set. Please generate or upload a featured image first.");
      return;
    }
    
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: featuredImage,
      altText: "Featured Image",
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl;

      if (onImageUpload) {
        // Use custom upload handler if provided
        imageUrl = await onImageUpload(file);
      } else {
        // Default: Upload to server
        const formData = new FormData();
        formData.append("image", file);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        
        const response = await fetch("/api/admin/upload/image", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Accept": "application/json",
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        imageUrl = data.url;
      }

      // Insert the image into the editor
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: imageUrl,
        altText: file.name,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg flex-wrap">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* History */}
      <ToolbarButton
        icon={Undo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Undo"
      />
      <ToolbarButton
        icon={Redo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Redo"
      />

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        icon={Bold}
        onClick={() => formatText("bold")}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        icon={Italic}
        onClick={() => formatText("italic")}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        icon={Underline}
        onClick={() => formatText("underline")}
        title="Underline (Ctrl+U)"
      />
      <ToolbarButton
        icon={Strikethrough}
        onClick={() => formatText("strikethrough")}
        title="Strikethrough"
      />
      <ToolbarButton
        icon={Code}
        onClick={() => formatText("code")}
        title="Inline Code"
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        icon={Heading1}
        onClick={() => formatHeading("h1")}
        title="Heading 1"
      />
      <ToolbarButton
        icon={Heading2}
        onClick={() => formatHeading("h2")}
        title="Heading 2"
      />
      <ToolbarButton
        icon={Heading3}
        onClick={() => formatHeading("h3")}
        title="Heading 3"
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        icon={List}
        onClick={() => insertList("bullet")}
        title="Bullet List"
      />
      <ToolbarButton
        icon={ListOrdered}
        onClick={() => insertList("number")}
        title="Numbered List"
      />

      <ToolbarDivider />

      {/* Block Formatting */}
      <ToolbarButton
        icon={Quote}
        onClick={formatQuote}
        title="Quote"
      />
      <ToolbarButton
        icon={Link}
        onClick={insertLink}
        title="Insert Link"
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        icon={AlignLeft}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        title="Align Left"
      />
      <ToolbarButton
        icon={AlignCenter}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        title="Align Center"
      />
      <ToolbarButton
        icon={AlignRight}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        title="Align Right"
      />
      <ToolbarButton
        icon={AlignJustify}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
        title="Justify"
      />

      <ToolbarDivider />

      {/* Image Upload */}
      <ToolbarButton
        icon={isUploading ? Loader2 : ImagePlus}
        onClick={handleImageClick}
        title="Insert Image"
        disabled={isUploading}
      />
      <ToolbarButton
        icon={Image}
        onClick={insertFeaturedImage}
        title={featuredImage ? "Insert Featured Image" : "No featured image available"}
        disabled={!featuredImage}
      />
    </div>
  );
}

// Plugin to load initial HTML content
function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only load once when we have content
    if (initialContent && !hasLoaded) {
      editor.update(() => {
        try {
          const parser = new DOMParser();
          // Wrap content in a div to ensure proper parsing
          const wrappedContent = `<div>${initialContent}</div>`;
          const dom = parser.parseFromString(wrappedContent, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          
          // Filter out text nodes - only element/decorator nodes can be appended to root
          const validNodes = nodes.filter(node => {
            const type = node.getType();
            return type !== 'text' && type !== 'linebreak';
          });
          
          const root = $getRoot();
          root.clear();
          
          if (validNodes.length > 0) {
            root.append(...validNodes);
          } else {
            // If no valid nodes, create a paragraph with the text
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          }
        } catch (error) {
          console.error('Failed to load initial content:', error);
        }
      });
      setHasLoaded(true);
    }
  }, [initialContent, hasLoaded, editor]);

  return null;
}

// Plugin to get HTML content on change
function HtmlExportPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
}

// Main Editor Component
export default function LexicalEditor({
  initialContent = "",
  onChange,
  placeholder = "Start writing your article...",
  minHeight = "400px",
  onImageUpload = null,
  featuredImage = null,
}) {
  const initialConfig = {
    namespace: "ArticleEditor",
    theme,
    onError: (error) => {
      console.error("Lexical Error:", error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      ImageNode,
    ],
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin onImageUpload={onImageUpload} featuredImage={featuredImage} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none p-4 prose prose-slate max-w-none"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ImagePlugin />
        <InitialContentPlugin initialContent={initialContent} />
        <HtmlExportPlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}

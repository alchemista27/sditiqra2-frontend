'use client';
// src/components/cms/ResizableImage.tsx
// Custom Tiptap extension untuk image dengan resize capability menggunakan drag handles

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from '@tiptap/extension-image';
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';

// ─── Resizable Image Component ────────────────────────────────────────────────
function ResizableImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Get natural image dimensions when loaded
  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, []);

  // Handle resize start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: 'nw' | 'ne' | 'sw' | 'se') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      
      // Get current dimensions
      const currentWidth = node.attrs.width || imgRef.current?.offsetWidth || naturalSize.width;
      const currentHeight = node.attrs.height || imgRef.current?.offsetHeight || naturalSize.height;
      const aspectRatio = currentWidth / currentHeight;
      
      // Get container max width
      const containerWidth = wrapperRef.current?.parentElement?.offsetWidth || 800;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = currentWidth;

        // Calculate new width based on handle position
        switch (handle) {
          case 'nw': // top-left - drag left decreases width
          case 'sw': // bottom-left
            newWidth = currentWidth - deltaX;
            break;
          case 'ne': // top-right - drag right increases width
          case 'se': // bottom-right
            newWidth = currentWidth + deltaX;
            break;
        }

        // Apply constraints
        newWidth = Math.max(100, Math.min(newWidth, containerWidth));
        const newHeight = Math.round(newWidth / aspectRatio);

        updateAttributes({
          width: Math.round(newWidth),
          height: newHeight,
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      // Set cursor and prevent text selection during resize
      document.body.style.cursor = `${handle}-resize`;
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [node.attrs.width, node.attrs.height, naturalSize, updateAttributes]
  );

  // Touch support for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, handle: 'nw' | 'ne' | 'sw' | 'se') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const touch = e.touches[0];
      const startX = touch.clientX;
      
      const currentWidth = node.attrs.width || imgRef.current?.offsetWidth || naturalSize.width;
      const currentHeight = node.attrs.height || imgRef.current?.offsetHeight || naturalSize.height;
      const aspectRatio = currentWidth / currentHeight;
      const containerWidth = wrapperRef.current?.parentElement?.offsetWidth || 800;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        const deltaX = moveTouch.clientX - startX;

        let newWidth = currentWidth;

        switch (handle) {
          case 'nw':
          case 'sw':
            newWidth = currentWidth - deltaX;
            break;
          case 'ne':
          case 'se':
            newWidth = currentWidth + deltaX;
            break;
        }

        newWidth = Math.max(100, Math.min(newWidth, containerWidth));
        const newHeight = Math.round(newWidth / aspectRatio);

        updateAttributes({
          width: Math.round(newWidth),
          height: newHeight,
        });
      };

      const handleTouchEnd = () => {
        setIsResizing(false);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    },
    [node.attrs.width, node.attrs.height, naturalSize, updateAttributes]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const { src, alt, title, width, height } = node.attrs;

  return (
    <NodeViewWrapper className="resizable-image-node">
      <div
        ref={wrapperRef}
        className={`resizable-image-wrapper ${isResizing ? 'is-resizing' : ''}`}
        data-selected={selected}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          onLoad={handleImageLoad}
          style={{
            width: width ? `${width}px` : 'auto',
            height: height ? `${height}px` : 'auto',
            maxWidth: '100%',
          }}
          draggable={false}
        />

        {/* Resize Handles - only show when selected */}
        {selected && (
          <>
            <div
              className="resize-handle nw"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              onTouchStart={(e) => handleTouchStart(e, 'nw')}
            />
            <div
              className="resize-handle ne"
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              onTouchStart={(e) => handleTouchStart(e, 'ne')}
            />
            <div
              className="resize-handle sw"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              onTouchStart={(e) => handleTouchStart(e, 'sw')}
            />
            <div
              className="resize-handle se"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              onTouchStart={(e) => handleTouchStart(e, 'se')}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ─── Resizable Image Extension ────────────────────────────────────────────────
export const ResizableImage = Image.extend({
  name: 'resizableImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;

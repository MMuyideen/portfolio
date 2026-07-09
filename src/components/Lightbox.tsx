import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface LightboxProps {
  src: string | null
  alt: string
  onClose: () => void
}

/**
 * Full-screen image viewer for diagrams and post screenshots. Opens when
 * `src` is set; closes on Escape, backdrop click, or the close button.
 */
export function Lightbox({ src, alt, onClose }: LightboxProps) {
  return (
    <Dialog.Root open={src !== null} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-150"
          aria-describedby={undefined}
          onClick={onClose}
        >
          <Dialog.Title className="sr-only">{alt || 'Enlarged image'}</Dialog.Title>
          {src && (
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full rounded border object-contain"
              onClick={event => event.stopPropagation()}
            />
          )}
          <Dialog.Close
            aria-label="Close image"
            className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded border bg-surface text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

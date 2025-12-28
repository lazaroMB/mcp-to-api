import Image from 'next/image';

interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  description: string;
  width?: number;
  height?: number;
}

export function ImagePlaceholder({ 
  src, 
  alt, 
  description, 
  width = 800, 
  height = 400 
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <div className="rounded-lg border bg-muted/50 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
        <p className="p-2 text-xs text-muted-foreground text-center">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/50 p-4 flex flex-col items-center justify-center min-h-[200px] border-dashed">
      <p className="text-muted-foreground text-sm text-center mb-2">
        📷 {description}
      </p>
      <p className="text-xs text-muted-foreground/70 text-center">
        Add image at: <code className="bg-muted px-1 rounded">/public/admin-guide/{alt.toLowerCase().replace(/\s+/g, '-')}.png</code>
      </p>
    </div>
  );
}

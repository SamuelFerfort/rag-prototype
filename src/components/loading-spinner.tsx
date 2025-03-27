import { Spinner } from "@/components/ui/spinner";

export function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  );
} 
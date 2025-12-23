import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type SliderProps = React.ComponentProps<typeof Slider>;

export function SliderDemo({ className, ...props }: SliderProps) {
  return (
    <Slider
      defaultValue={[100]}
      max={100}
      step={1}
      className={cn("h-0.5", className)}
      {...props}
    />
  );
}

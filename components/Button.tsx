import { forwardRef } from "react";

type ButtonProps = JSX.IntrinsicElements["div"];
interface Props extends ButtonProps {
  variant?: "secondary" | "primary";
  roundedR?: boolean;
  roundedL?: boolean;
  roundedB?: boolean;
  roundedT?: boolean;
  active?: boolean;
  disabled?: boolean;
}
export default forwardRef<HTMLDivElement, Props>(function Button(
  {
    variant = "primary",
    className,
    roundedR = true,
    roundedL = true,
    roundedT = true,
    roundedB = true,
    active = false,
    disabled,
    ...props
  },
  ref?
) {
  let cls = "";

  if (variant === "primary") {
    cls = "ring-[1.5px]  text-main  shadow ";
    if (disabled) {
      cls += "text-opacity-20";
    }

    if (active) {
      cls += "text-active-2  bg-active-1 ring-active-2 z-20 ";
    } else {
      cls += " bg-bg-2 text-icon ring-outline";
      if (!disabled) {
        cls += " hover:ring hover:ring-gray-300";
      }
    }
    
  } else {
    cls = " bg-blue-500  text-white shadow ";

    if (!disabled) {
      cls += " hover:ring hover:ring-gray-300";
    } else {
      cls += "opacity-50";
    }
  }

  if (roundedR === false) {
    cls += " rounded-r-none";
  }
  if (roundedL === false) {
    cls += " rounded-l-none";
  }
  if (roundedT === false) {
    cls += " rounded-t-none";
  }
  if (roundedB === false) {
    cls += " rounded-b-none";
  }

  if (!disabled && !active) {
    cls += " cursor-pointer";
  }
  return (
    <div
      {...props}
      ref={ref}
      className={`h-8 rounded flex items-center justify-center hover:z-10 ${className} ${cls}`}
    />
  );
});

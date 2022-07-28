import { memo } from "react";

type ButtonProps = JSX.IntrinsicElements["button"];
interface Props extends ButtonProps {
  variant?: "secondary" | "primary";
}
export default memo(function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  let cls = "";

  if (variant === "primary") {
    cls =
      "bg-zinc-800 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50";
  } else {
    cls = "bg-blue-500 text-white hover:ring hover:ring-gray-300 shadow ";
  }

  return (
    <button
      {...props}
      className={`h-8  px-1.5 rounded flex items-center justify-center ${className} ${cls}`}
    />
  );
});

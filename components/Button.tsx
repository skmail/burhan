import { memo } from "react";

type ButtonProps = JSX.IntrinsicElements["button"];
interface Props extends ButtonProps {
  variant?: "secondary" | "primary";
  roundedR?: boolean;
  roundedL?: boolean;
  roundedB?: boolean;
  roundedT?: boolean;
  active?: boolean;
}
export default memo(function Button({
  variant = "primary",
  className,
  roundedR = true,
  roundedL = true,
  roundedT = true,
  roundedB = true,
  active = false,
  ...props
}: Props) {
  let cls = "";

  if (variant === "primary") {
    cls = "ring-[1.5px]  text-main  shadow disabled:text-opacity-20 ";

    if (active) {
      cls += " bg-active-1 ring-active-2 z-20 ";
    } else {
      cls +=
        " bg-bg-2  enabled:hover:ring enabled:hover:ring-gray-300 ring-outline";
    }
  } else {
    cls =
      "bg-blue-500 disabled:opacity-50 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow ";
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

  return (
    <button
      {...props}
      className={`h-8 rounded flex items-center justify-center hover:z-10 ${className} ${cls}`}
    />
  );
});

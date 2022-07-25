type ButtonProps = JSX.IntrinsicElements["button"];
interface Props extends ButtonProps {
  variant?: "secondary" | "primary";
}
export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  let cls = "";

  if (variant === "primary") {
    cls = "bg-white text-gray-600 enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50";
  } else {
    cls = "bg-blue-500 text-white hover:ring hover:ring-gray-300 shadow ";
  }

  return (
    <button
      {...props}
      className={`w-8 h-8 rounded flex items-center justify-center ${className} ${cls}`}
    />
  );
}

type ButtonProps = {
  onClick: () => void;
  label?: string;
  bgColor?: string;
  textColor?: string;
  hoverColor?: string;
};

export default function Button({
        onClick,
        label,
        bgColor,
        textColor,
        hoverColor,
    }: ButtonProps) {
          return (
    <button
      onClick={onClick}
      className={`${bgColor} ${textColor} ${hoverColor} font-semibold px-6 py-2 rounded-lg shadow-md transition`}
    >
      {label}
    </button>
  );
}
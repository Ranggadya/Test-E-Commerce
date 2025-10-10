interface InputFieldProps {
  id: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
}

export default function InputField({ id, type, value, placeholder, onChange }: InputFieldProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  );
}

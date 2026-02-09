interface FormHeaderProps {
  title: string
  description: string
}

export default function FormHeader({
  title,
  description,
}: FormHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">{description}</p>
      </div>
    </div>
  )
}

export const AUDIO_CATEGORIES = [
  'Music',
  'Podcast',
  'Audiobook',
  'Sound Effect',
  'Voice Recording',
  'Interview',
  'Lecture',
  'Other',
]

export default function AudioCategories() {
  return (
    <ul className="flex flex-wrap gap-2">
      {AUDIO_CATEGORIES.map((cat) => (
        <li key={cat} className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
          {cat}
        </li>
      ))}
    </ul>
  )
} 
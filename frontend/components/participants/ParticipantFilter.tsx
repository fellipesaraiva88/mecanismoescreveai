'use client'

interface ParticipantFilterProps {
  filters: any
  onChange: (filters: any) => void
}

export function ParticipantFilter({ filters, onChange }: ParticipantFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Sentimento</label>
        <select
          value={filters.sentiment}
          onChange={(e) => onChange({ ...filters, sentiment: e.target.value })}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2"
        >
          <option value="all">Todos</option>
          <option value="positive">Positivo</option>
          <option value="neutral">Neutro</option>
          <option value="negative">Negativo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Atividade</label>
        <select
          value={filters.activity}
          onChange={(e) => onChange({ ...filters, activity: e.target.value })}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2"
        >
          <option value="all">Todos</option>
          <option value="high">Alta (&gt;200)</option>
          <option value="medium">Média (100-200)</option>
          <option value="low">Baixa (&lt;100)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2"
        >
          <option value="messages">Mais mensagens</option>
          <option value="sentiment">Sentimento</option>
          <option value="recent">Mais recentes</option>
        </select>
      </div>
    </div>
  )
}

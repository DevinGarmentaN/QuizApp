import React, { useState } from 'react';
import { Question, QuestionType, OptionItem, MatchingPair } from '../../types/quiz';
import { 
  X, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Check, 
  ListChecks, 
  CheckSquare, 
  ToggleLeft, 
  Type, 
  AlignLeft, 
  Shuffle, 
  ArrowUpDown,
  Sparkles,
  Info
} from 'lucide-react';

interface QuestionModalEditorProps {
  question: Partial<Question>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<Question>) => void;
}

export const QuestionModalEditor: React.FC<QuestionModalEditorProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<QuestionType>(question.type || 'single_choice');
  const [title, setTitle] = useState(question.title || '');
  const [description, setDescription] = useState(question.description || '');
  const [points, setPoints] = useState(question.points ?? 10);
  const [isRequired, setIsRequired] = useState(question.isRequired ?? true);
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [hint, setHint] = useState(question.hint || '');
  const [shuffleOptions, setShuffleOptions] = useState(question.shuffleOptions ?? false);
  const [caseSensitive, setCaseSensitive] = useState(question.caseSensitive ?? false);

  // Options state
  const [options, setOptions] = useState<OptionItem[]>(() => {
    if (question.options && question.options.length > 0) {
      return JSON.parse(JSON.stringify(question.options));
    }
    if (type === 'true_false') {
      return [
        { id: 'tf-1', text: 'Benar (True)', isCorrect: true },
        { id: 'tf-2', text: 'Salah (False)', isCorrect: false },
      ];
    }
    return [
      { id: 'opt-1', label: 'A', text: 'Pilihan A', isCorrect: true },
      { id: 'opt-2', label: 'B', text: 'Pilihan B', isCorrect: false },
      { id: 'opt-3', label: 'C', text: 'Pilihan C', isCorrect: false },
      { id: 'opt-4', label: 'D', text: 'Pilihan D', isCorrect: false },
    ];
  });

  // Matching pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(() => {
    if (question.matchingPairs && question.matchingPairs.length > 0) {
      return JSON.parse(JSON.stringify(question.matchingPairs));
    }
    return [
      { id: 'm-1', leftText: 'Istilah A', rightText: 'Definisi atau Pasangan A' },
      { id: 'm-2', leftText: 'Istilah B', rightText: 'Definisi atau Pasangan B' },
      { id: 'm-3', leftText: 'Istilah C', rightText: 'Definisi atau Pasangan C' },
    ];
  });

  // Short answer correct answers list
  const [correctAnswersText, setCorrectAnswersText] = useState<string>(() => {
    if (question.correctAnswers && question.correctAnswers.length > 0) {
      return question.correctAnswers.join('\n');
    }
    return '';
  });

  const questionTypes: { id: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'single_choice', label: 'Pilihan Ganda (1 Jawaban)', icon: ListChecks },
    { id: 'multiple_choice', label: 'Pilihan Ganda (Multi Jawaban)', icon: CheckSquare },
    { id: 'true_false', label: 'Benar / Salah (True/False)', icon: ToggleLeft },
    { id: 'short_answer', label: 'Isian Singkat (Text Fill)', icon: Type },
    { id: 'essay', label: 'Esai / Uraian Panjang', icon: AlignLeft },
    { id: 'matching', label: 'Menjodohkan (Matching)', icon: Shuffle },
  ];

  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === 'true_false' && options.length !== 2) {
      setOptions([
        { id: 'tf-1', text: 'Benar (True)', isCorrect: true },
        { id: 'tf-2', text: 'Salah (False)', isCorrect: false },
      ]);
    } else if ((newType === 'single_choice' || newType === 'multiple_choice') && options.length < 2) {
      setOptions([
        { id: 'opt-1', label: 'A', text: 'Pilihan A', isCorrect: true },
        { id: 'opt-2', label: 'B', text: 'Pilihan B', isCorrect: false },
        { id: 'opt-3', label: 'C', text: 'Pilihan C', isCorrect: false },
        { id: 'opt-4', label: 'D', text: 'Pilihan D', isCorrect: false },
      ]);
    }
  };

  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextLetter = letters[options.length] || `Pilihan ${options.length + 1}`;
    setOptions([
      ...options,
      {
        id: 'opt-' + Date.now(),
        label: nextLetter,
        text: `Pilihan ${nextLetter}`,
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert('Soal pilihan ganda membutuhkan minimal 2 opsi.');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    setOptions(updated.map((opt, i) => ({ ...opt, label: letters[i] || `${i + 1}` })));
  };

  const handleOptionCorrectToggle = (index: number) => {
    if (type === 'single_choice' || type === 'true_false') {
      setOptions(
        options.map((opt, i) => ({
          ...opt,
          isCorrect: i === index,
        }))
      );
    } else {
      setOptions(
        options.map((opt, i) => (i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt))
      );
    }
  };

  const handleAddMatchingPair = () => {
    setMatchingPairs([
      ...matchingPairs,
      { id: 'm-' + Date.now(), leftText: '', rightText: '' },
    ]);
  };

  const handleRemoveMatchingPair = (index: number) => {
    if (matchingPairs.length <= 2) {
      alert('Minimal terdapat 2 pasangan mencocokkan.');
      return;
    }
    setMatchingPairs(matchingPairs.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Teks pertanyaan tidak boleh kosong.');
      return;
    }

    let parsedCorrectAnswers: string[] | undefined = undefined;
    if (type === 'short_answer' || type === 'fill_blank') {
      parsedCorrectAnswers = correctAnswersText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    onSave({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      points: Number(points) || 0,
      isRequired,
      explanation: explanation.trim() || undefined,
      hint: hint.trim() || undefined,
      shuffleOptions,
      caseSensitive,
      options: type === 'single_choice' || type === 'multiple_choice' || type === 'true_false' ? options : [],
      matchingPairs: type === 'matching' ? matchingPairs : undefined,
      correctAnswers: parsedCorrectAnswers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-400" />
              {question.id ? 'Edit Soal / Pertanyaan' : 'Tambah Soal Baru'}
            </h3>
            <p className="text-xs text-slate-300">Konfigurasi tipe soal, kunci jawaban, dan bobot poin.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          
          {/* Question Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipe Pertanyaan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {questionTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id)}
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teks Pertanyaan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kumpulan data terstruktur yang saling berhubungan..."
                rows={3}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Petunjuk Tambahan / Catatan Soal (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Pilihlah satu jawaban yang paling benar."
                className="w-full px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Answer Options section based on Type */}
          <div className="border-t border-slate-200 pt-5">
            
            {/* Single Choice / Multiple Choice / True False */}
            {(type === 'single_choice' || type === 'multiple_choice' || type === 'true_false') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Opsi Pilihan Jawaban
                    </h4>
                    <p className="text-xs text-slate-500">
                      {type === 'single_choice'
                        ? 'Klik tombol radio pada jawaban yang benar (hanya 1 jawaban benar).'
                        : type === 'multiple_choice'
                        ? 'Centang kotak pada jawaban yang benar (bisa lebih dari 1 jawaban).'
                        : 'Pilih opsi yang merupakan jawaban benar.'}
                    </p>
                  </div>
                  {type !== 'true_false' && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Opsi
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition ${
                        opt.isCorrect
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Selection Radio / Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleOptionCorrectToggle(idx)}
                        className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          opt.isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
                        }`}
                        title={opt.isCorrect ? 'Jawaban Benar' : 'Jadikan Jawaban Benar'}
                      >
                        {opt.isCorrect ? <Check className="w-4 h-4" /> : opt.label || idx + 1}
                      </button>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].text = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Teks pilihan ${opt.label || idx + 1}`}
                        className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />

                      {/* Correct answer indicator tag */}
                      {opt.isCorrect && (
                        <span className="hidden sm:inline text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          Kunci Jawaban
                        </span>
                      )}

                      {/* Delete option button */}
                      {type !== 'true_false' && options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus opsi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short Answer */}
            {type === 'short_answer' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kunci Jawaban Isian Singkat
                </h4>
                <p className="text-xs text-slate-500">
                  Tuliskan kunci jawaban yang dapat diterima (satu variasi per baris). Sistem akan mencocokkan input peserta.
                </p>
                <textarea
                  value={correctAnswersText}
                  onChange={(e) => setCorrectAnswersText(e.target.value)}
                  placeholder="Contoh:&#10;useEffect&#10;useeffect&#10;React.useEffect"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Sensitif huruf besar/kecil (Case Sensitive)</span>
                </label>
              </div>
            )}

            {/* Matching Question */}
            {type === 'matching' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pasangan Menjodohkan
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tuliskan pasangan yang cocok (kiri & kanan). Saat ujian, pilihan kanan akan diacak otomatis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMatchingPair}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Pasangan
                  </button>
                </div>

                <div className="space-y-2">
                  {matchingPairs.map((pair, idx) => (
                    <div key={pair.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={pair.leftText}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx].leftText = e.target.value;
                          setMatchingPairs(updated);
                        }}
                        placeholder="Istilah / Pertanyaan (Kiri)"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400 font-bold">➔</span>
                      <input
                        type="text"
                        value={pair.rightText}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx].rightText = e.target.value;
                          setMatchingPairs(updated);
                        }}
                        placeholder="Jawaban / Definisi Pasangan (Kanan)"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                      {matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchingPair(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essay Info */}
            {type === 'essay' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Penilaian Jawaban Esai:</p>
                  <p className="mt-0.5">
                    Jawaban esai disimpan lengkap untuk dapat ditinjau dan dinilai secara manual oleh pengajar di menu Analisis Hasil.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Points, Settings & Explanation */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bobot Poin Soal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500">Poin</span>
                </div>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Wajib Dijawab (Required)</span>
                </label>

                {(type === 'single_choice' || type === 'multiple_choice') && (
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Acak urutan pilihan untuk tiap siswa</span>
                  </label>
                )}
              </div>
            </div>

            {/* Explanation / Pembahasan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pembahasan & Penjelasan Kunci Jawaban (Ditampilkan di Lembar Hasil)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Jelaskan alasan ilmiah/teoritis mengapa jawaban tersebut benar untuk edukasi siswa..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
            >
              Simpan Pertanyaan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

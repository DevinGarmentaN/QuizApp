import React, { useState, useRef } from 'react';
import { Question, QuestionType, OptionItem, MatchingPair } from '../../types/quiz';
import { 
  X, 
  Plus, 
  Trash2, 
  ListChecks, 
  CheckSquare, 
  ToggleLeft, 
  Type, 
  AlignLeft, 
  Shuffle, 
  ArrowUpDown,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

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
  const [imageUrl, setImageUrl] = useState(question.imageUrl || '');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('File yang dipilih harus berupa format gambar (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    try {
      setIsUploadingImage(true);
      setImageError('');
      // Compress to high quality WebP/JPEG under 1000px width
      const compressedDataUrl = await compressImageFile(file, 1000, 1000, 0.82);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process image file:', err);
      setImageError('Gagal memproses file gambar. Silakan coba gambar lain.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !imageUrl.trim()) {
      alert('Pertanyaan harus memiliki teks pertanyaan atau gambar.');
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
      title: title.trim() || 'Pertanyaan bergambar',
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
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
            <p className="text-xs text-slate-300">Konfigurasi tipe soal, teks/gambar pertanyaan, kunci jawaban, dan bobot poin.</p>
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

          {/* Question Title & Image Upload */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Teks Pertanyaan <span className="text-rose-500">*</span>
                </label>
                {imageUrl && (
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Memiliki Lampiran Gambar
                  </span>
                )}
              </div>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tuliskan teks pertanyaan di sini (misal: Perhatikan potongan kode/diagram/tabel berikut...)"
                rows={3}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Image Attachment Box */}
            <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Gambar / Media Soal (Opsional)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      imageInputMode === 'upload'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      imageInputMode === 'url'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Link URL
                  </button>
                </div>
              </div>

              {/* Upload or URL input area */}
              {!imageUrl ? (
                <div>
                  {imageInputMode === 'upload' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="question-image-upload"
                      />
                      <label
                        htmlFor="question-image-upload"
                        className={`border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white transition text-center ${
                          isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mengompres & memproses gambar...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <Upload className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                Klik untuk memilih gambar dari perangkat
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Format didukung: PNG, JPG, JPEG, WebP, SVG, GIF (Maks. disarankan 10MB)
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/diagram-relasional.png"
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Tempelkan link gambar publik langsung dari hosting/cloud storage.
                      </p>
                    </div>
                  )}

                  {imageError && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{imageError}</p>
                  )}
                </div>
              ) : (
                /* Image Preview when already uploaded/linked */
                <div className="relative bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Pratinjau Gambar Soal:</span>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="question-image-upload-change"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                      >
                        Ganti Gambar
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="question-image-upload-change"
                      />
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-hidden rounded-lg bg-slate-900/5 flex items-center justify-center p-2 border border-slate-100">
                    <img
                      src={imageUrl}
                      alt="Pratinjau Soal"
                      className="max-h-56 max-w-full object-contain rounded"
                      onError={() => setImageError('Gambar gagal dimuat dari sumber. Pastikan link atau file valid.')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Petunjuk Tambahan / Catatan Soal (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Pilihlah satu jawaban yang paling benar berdasarkan diagram di atas."
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
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          opt.isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-100'
                        }`}
                        title={opt.isCorrect ? 'Kunci Jawaban Benar' : 'Jadikan Kunci Jawaban'}
                      >
                        {opt.isCorrect ? '✓' : opt.label || idx + 1}
                      </button>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setOptions(updated);
                        }}
                        placeholder={`Teks pilihan ${opt.label || idx + 1}`}
                        required
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />

                      {/* Correct Badge */}
                      {opt.isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md shrink-0">
                          Kunci Jawaban
                        </span>
                      )}

                      {/* Delete Option (Not allowed for True/False) */}
                      {type !== 'true_false' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          disabled={options.length <= 2}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded hover:bg-slate-100 transition"
                          title="Hapus opsi ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short Answer / Fill in Blank */}
            {(type === 'short_answer' || type === 'fill_blank') && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kunci Jawaban Benar (Isian Singkat)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tuliskan variasi jawaban yang dianggap benar, satu jawaban per baris.
                  </p>
                </div>
                <textarea
                  value={correctAnswersText}
                  onChange={(e) => setCorrectAnswersText(e.target.value)}
                  placeholder="Jawaban Benar 1&#10;jawaban benar 1&#10;JAWABAN BENAR 1"
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Sensitif terhadap huruf besar/kecil (Case Sensitive)</span>
                </label>
              </div>
            )}

            {/* Essay Question */}
            {type === 'essay' && (
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-2 text-xs text-slate-700">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-indigo-600" />
                  <span>Soal Tipe Esai / Uraian Bebas</span>
                </div>
                <p>
                  Peserta akan diberikan kotak teks besar untuk mengetikkan jawaban panjang secara bebas.
                  Penilaian esai dapat dinilai secara manual oleh dosen/pengajar pada menu Analisis Respon.
                </p>
              </div>
            )}

            {/* Matching Pairs Question */}
            {type === 'matching' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pasangan Menjodohkan (Matching Pairs)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tentukan pasangan yang tepat antara kolom kiri dan kolom kanan.
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
                    <div
                      key={pair.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/70"
                    >
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={pair.leftText}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx] = { ...updated[idx], leftText: e.target.value };
                          setMatchingPairs(updated);
                        }}
                        placeholder="Istilah / Soal Kiri"
                        required
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={pair.rightText}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx] = { ...updated[idx], rightText: e.target.value };
                          setMatchingPairs(updated);
                        }}
                        placeholder="Definisi / Jawaban Kanan"
                        required
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMatchingPair(idx)}
                        disabled={matchingPairs.length <= 2}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded hover:bg-slate-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Points, Settings & Explanation */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Points */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bobot Poin Soal
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 text-xs sm:text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">Poin</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
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

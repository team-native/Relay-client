import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { createStudy } from '../../api/studyApi';
import { getServerErrorMessage } from '../../api/errors';
import { WheelPicker, WheelPickerGroup, type WheelOption } from '../../components/ui/WheelPicker';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MINUTE_STEP = 10;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 100;
const DEFAULT_CAPACITY = 20;
const DEFAULT_HOUR = 19;

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function toOptions(values: number[], suffix: string, pad = false): WheelOption[] {
  return values.map((value) => ({
    value,
    label: `${pad ? String(value).padStart(2, '0') : value}${suffix}`,
  }));
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const TODAY = new Date();

const YEAR_OPTIONS = toOptions(range(2026, 2050), '년');
const MONTH_OPTIONS = toOptions(range(1, 12), '월');
const HOUR_OPTIONS = toOptions(range(0, 23), '시');
const MINUTE_OPTIONS = toOptions(
  range(0, 60 / MINUTE_STEP - 1).map((step) => step * MINUTE_STEP),
  '분',
  true
);

function NumberStepper({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
}) {
  return (
    <div className="inline-flex items-center h-11 border border-gray-200 rounded-lg bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`${label} 줄이기`}
        className="w-11 h-full flex items-center justify-center text-gray-500 disabled:text-gray-200"
      >
        <Minus className="w-4 h-4" strokeWidth={2} />
      </button>
      <span className="w-16 text-center text-sm font-semibold">{value}명</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`${label} 늘리기`}
        className="w-11 h-full flex items-center justify-center text-gray-500 disabled:text-gray-200"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export default function StudyCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [presenter, setPresenter] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);

  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth() + 1);
  const [day, setDay] = useState(TODAY.getDate());
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [minute, setMinute] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(
    () => toOptions(range(1, getDaysInMonth(year, month)), '일'),
    [year, month]
  );

  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
  const pad = (value: number) => String(value).padStart(2, '0');
  const scheduledAt = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !presenter.trim() || !description.trim()) {
      setError('제목, 연사자, 연사 소개를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createStudy({
        title: title.trim(),
        presenter: presenter.trim(),
        scheduledAt,
        capacity,
        description: description.trim(),
      });
      navigate('/');
    } catch (err) {
      setError(getServerErrorMessage(err, '등록에 실패했어요. 다시 시도해주세요.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">새 릴레이 스터디 등록</h1>
      <p className="text-gray-400 mt-1">다음 릴레이 주자가 되어 릴레이 스터디를 진행해보세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <label htmlFor="study-title" className="block text-sm font-medium mb-1.5">
          연사 제목
        </label>
        <input
          id="study-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 프론트엔드 협업 기초"
          className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
        />

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-sm font-medium mb-1.5">날짜</p>
            <WheelPickerGroup>
              <WheelPicker options={YEAR_OPTIONS} value={year} onChange={setYear} label="연도" />
              <WheelPicker options={MONTH_OPTIONS} value={month} onChange={setMonth} label="월" />
              <WheelPicker options={dayOptions} value={day} onChange={setDay} label="일" />
            </WheelPickerGroup>
            <p className="text-sm text-amber-500 mt-2">
              {year}. {month}. {day} ({weekday})
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1.5">시간</p>
            <WheelPickerGroup>
              <WheelPicker options={HOUR_OPTIONS} value={hour} onChange={setHour} label="시" />
              <WheelPicker
                options={MINUTE_OPTIONS}
                value={minute}
                onChange={setMinute}
                label="분"
              />
            </WheelPickerGroup>
            <p className="text-sm text-amber-500 mt-2">
              {hour} : {pad(minute)}
            </p>
          </div>
        </div>

        <label htmlFor="study-presenter" className="block text-sm font-medium mt-5 mb-1.5">
          연사자
        </label>
        <input
          id="study-presenter"
          value={presenter}
          onChange={(e) => setPresenter(e.target.value)}
          placeholder="예) 1308 양지우"
          className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          발표를 진행할 연사자의 학번과 이름을 적어주세요.
        </p>

        <p className="text-sm font-medium mt-5 mb-1.5">모집 인원</p>
        <NumberStepper
          value={capacity}
          onChange={setCapacity}
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          label="모집 인원"
        />

        <label htmlFor="study-description" className="block text-sm font-medium mt-5 mb-1.5">
          연사 소개
        </label>
        <textarea
          id="study-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="연사 장소, 연사 대상 등 세부적인 내용과 간단한 연사 내용 등을 적어주세요."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
        />

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 mt-6 rounded-lg bg-[#FFDD86] text-black font-semibold hover:brightness-95 transition disabled:opacity-50"
        >
          {isSubmitting ? '등록 중...' : '강의 등록하기'}
        </button>
      </form>
    </div>
  );
}

import Select from './Select'
import Input from './Input'
import { DATE_FILTER_OPTIONS } from '@/constants'

/**
 * Reusable date/time filter bar.
 * Stacks vertically on mobile, horizontal on sm+.
 */
export default function DateTimeFilter({
  params,
  setParams,
  dropdownOptions = DATE_FILTER_OPTIONS,
}) {
  const isDateRange = params.search === 'date range'

  return (
    <div className="flex flex-wrap items-end gap-2 w-full sm:w-auto">
      <Select
        options={dropdownOptions.map((o) => ({
          value: o,
          label: o.charAt(0).toUpperCase() + o.slice(1),
        }))}
        value={params.search || 'all'}
        onChange={(e) =>
          setParams((p) => ({
            ...p,
            search: e.target.value,
            startDate: null,
            endDate: null,
            page: 1,
          }))
        }
        className="w-full sm:w-40"
      />

      {isDateRange && (
        <>
          <Input
            type="date"
            value={params.startDate || ''}
            onChange={(e) =>
              setParams((p) => ({ ...p, startDate: e.target.value, page: 1 }))
            }
            className="w-full sm:w-40"
            placeholder="Start date"
          />
          <Input
            type="date"
            value={params.endDate || ''}
            onChange={(e) =>
              setParams((p) => ({ ...p, endDate: e.target.value, page: 1 }))
            }
            className="w-full sm:w-40"
            placeholder="End date"
          />
        </>
      )}
    </div>
  )
}

export const LUNAR_RAILS_VALUES = [
  {
    key: 'truth_over_comfort',
    label: 'Truth Over Comfort',
    description: 'We speak with honesty and integrity',
  },
  {
    key: 'act_with_agency',
    label: 'Act With Agency',
    description: 'We take ownership and initiative',
  },
  {
    key: 'focus_on_future',
    label: 'Focus On Future',
    description: 'We think long-term and strategically',
  },
  {
    key: 'ship_great_things',
    label: 'Ship Great Things',
    description: 'We deliver quality with impact',
  },
  {
    key: 'say_hard_things',
    label: 'Say Hard Things',
    description: 'We give candid feedback and have difficult conversations',
  },
  {
    key: 'one_team_one_system',
    label: 'One Team One System',
    description: 'We act as one unified organization',
  },
]

export const RATING_SCALE = [
  {
    value: 1,
    label: 'Exceptional',
    description: 'Consistently exceeds expectations',
  },
  {
    value: 2,
    label: 'Exceeds',
    description: 'Regularly exceeds expectations',
  },
  {
    value: 3,
    label: 'Meets',
    description: 'Meets expectations consistently',
  },
  {
    value: 4,
    label: 'Below',
    description: 'Below expectations',
  },
  {
    value: 5,
    label: 'Improvement Needed',
    description: 'Significant improvement needed',
  },
]

export const VALUE_COLORS: Record<string, string> = {
  truth_over_comfort: 'bg-blue-100 text-blue-800 border-blue-300',
  act_with_agency: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  focus_on_future: 'bg-purple-100 text-purple-800 border-purple-300',
  ship_great_things: 'bg-orange-100 text-orange-800 border-orange-300',
  say_hard_things: 'bg-red-100 text-red-800 border-red-300',
  one_team_one_system: 'bg-indigo-100 text-indigo-800 border-indigo-300',
}

export const QUARTERLY_MONTHS = [3, 6, 9, 12]

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  HR_ADMIN: 'HR_ADMIN',
} as const

export const MEETING_TYPES = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const

export const MEETING_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
} as const

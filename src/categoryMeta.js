import {
  IC_CAT_FOOD, IC_CAT_GROCERY, IC_CAT_TRANSPORT, IC_CAT_HOME,
  IC_CAT_CLOTHING, IC_CAT_ENTERTAINMENT, IC_CAT_SHOPPING,
  IC_CAT_OTHER, IC_CAT_UTILITIES,
} from './icons'

// Maps DB category key → bundled icon (base64 data URI after build) + exact inner pixel dimensions
export const CATEGORY_ICON_MAP = {
  food:          { url: IC_CAT_FOOD,          iw: 13.425, ih: 22.646 },
  grocery:       { url: IC_CAT_GROCERY,       iw: 22.539, ih: 19.199 },
  transport:     { url: IC_CAT_TRANSPORT,     iw: 27.836, ih: 12.57  },
  home:          { url: IC_CAT_HOME,          iw: 23.32,  ih: 20.537 },
  clothing:      { url: IC_CAT_CLOTHING,      iw: 25.72,  ih: 21.27  },
  entertainment: { url: IC_CAT_ENTERTAINMENT, iw: 28.193, ih: 17.695 },
  shopping:      { url: IC_CAT_SHOPPING,      iw: 19.883, ih: 19.727 },
  health:        { url: IC_CAT_OTHER,         iw: 14.578, ih: 2.961  },
  education:     { url: IC_CAT_OTHER,         iw: 14.578, ih: 2.961  },
  utilities:     { url: IC_CAT_UTILITIES,     iw: 19.883, ih: 19.727 },
  other:         { url: IC_CAT_OTHER,         iw: 14.578, ih: 2.961  },
}

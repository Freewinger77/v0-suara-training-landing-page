# Quick Reference: Regional Story Distribution

## 🗺️ State Starting Points

```
┌─────────────────────────────────────────────────────────────┐
│                    MALAYSIA (16 States)                     │
│                     280 Stories (9 Batches)                 │
└─────────────────────────────────────────────────────────────┘

BATCH 1 (Stories 1-31)          BATCH 2 (Stories 32-62)
├─ Johor                         ├─ Kedah
└─ Perak                         └─ Perlis

BATCH 3 (Stories 63-93)         BATCH 4 (Stories 94-124)
├─ Kelantan                      ├─ Kuala Lumpur
└─ Putrajaya                     └─ Sabah

BATCH 5 (Stories 125-155)       BATCH 6 (Stories 156-186)
├─ Labuan                        ├─ Melaka
└─ Sarawak                       └─ Selangor

BATCH 7 (Stories 187-217)       BATCH 8 (Stories 218-248)
├─ Negeri Sembilan               └─ Pahang
└─ Terengganu

BATCH 9 (Stories 249-280)
└─ Penang
```

---

## 📖 Example User Journeys

### Penang User (Starts Batch 9)
```
Progress Bar: 0% ─────────────────────────────────── 100%

Session 1:  ████ Stories 249-252 (Batch 9)
Session 2:  ████ Stories 253-256 (Batch 9)
...
Session 8:  ████ Stories 277-280 (Batch 9) ✓ Batch Complete
Session 9:  ████ Stories 1-4 (Batch 1)
Session 10: ████ Stories 5-8 (Batch 1)
...
Session 70: ████ Stories 245-248 (Batch 8) ✓ All Complete! 🎉
```

### Johor User (Starts Batch 1)
```
Progress Bar: 0% ─────────────────────────────────── 100%

Session 1:  ████ Stories 1-4 (Batch 1)
Session 2:  ████ Stories 5-8 (Batch 1)
...
Session 8:  ████ Stories 29-31 (Batch 1) ✓ Batch Complete
Session 9:  ████ Stories 32-35 (Batch 2)
Session 10: ████ Stories 36-39 (Batch 2)
...
Session 70: ████ Stories 277-280 (Batch 9) ✓ All Complete! 🎉
```

---

## 🔢 Batch Ranges Reference

| Batch | Story IDs | Count | Example Title |
|-------|-----------|-------|---------------|
| 1 | 1 - 31 | 31 | Story #1 - National Governance |
| 2 | 32 - 62 | 31 | Story #34 - Organization and HR |
| 3 | 63 - 93 | 31 | Story #63 - ... |
| 4 | 94 - 124 | 31 | Story #94 - ... |
| 5 | 125 - 155 | 31 | Story #125 - ... |
| 6 | 156 - 186 | 31 | Story #156 - ... |
| 7 | 187 - 217 | 31 | Story #187 - ... |
| 8 | 218 - 248 | 31 | Story #218 - ... |
| 9 | 249 - 280 | **32** | Story #249 - Startup Co-Working |

---

## 🛠️ Developer Quick Commands

### Check what story a region starts at:
```typescript
import { getStartingBatch } from '@/lib/state-batch-mapping'

const batch = getStartingBatch('Penang')  // Returns: 9
```

### Get batch sequence for a region:
```typescript
import { createBatchSequence } from '@/lib/state-batch-mapping'

const sequence = createBatchSequence(9)  
// Returns: [9, 1, 2, 3, 4, 5, 6, 7, 8]
```

### Get next story for a user:
```typescript
import { getNextStoryForRegion } from '@/lib/training-texts'

const story = getNextStoryForRegion('Penang', [249, 250, 251])
// Returns: Story #252 (next uncompleted in Batch 9)
```

### Check which batch a story belongs to:
```typescript
import { getBatchForStory } from '@/lib/state-batch-mapping'

const batch = getBatchForStory(250)  // Returns: 9
```

---

## 📊 Distribution Statistics

```
Total Stories: 280
Total Batches: 9
Total States: 16

Average stories per batch: 31.1
States per batch (distribution):
  - Batch 1: 2 states (12.5%)
  - Batch 2: 2 states (12.5%)
  - Batch 3: 2 states (12.5%)
  - Batch 4: 2 states (12.5%)
  - Batch 5: 2 states (12.5%)
  - Batch 6: 2 states (12.5%)
  - Batch 7: 2 states (12.5%)
  - Batch 8: 1 state (6.25%)
  - Batch 9: 1 state (6.25%)

Distribution fairness: ✓ Excellent
(14 out of 16 states have a partner starting at same batch)
```

---

## 🎯 What Users See vs What System Knows

### User View (Frontend)
```
┌─────────────────────────────────────────┐
│  Training Page                          │
│                                         │
│  Story 32 of 280                       │
│                                         │
│  [AI Reference Text displayed here]    │
│                                         │
│  [Correction textarea]                 │
│                                         │
│  [Audio recorder]                      │
└─────────────────────────────────────────┘

❌ No mention of "batches"
❌ No mention of "regions"
✅ Just "Story X of 280"
```

### System View (Backend Logs)
```
📊 User from Kedah has completed 35 stories
📖 Next story for region Kedah (starts Batch 2): {
  storyId: 68,
  title: 'Story #68 - ...',
  currentStory: 36,
  totalStories: 280
}

✅ Full batch tracking
✅ Region-aware distribution
✅ Detailed progress logging
```

---

## ⚡ Performance Notes

- **Story lookup**: O(1) - Direct array access
- **Batch sequence creation**: O(1) - Simple array operations
- **Next story search**: O(n) where n ≤ 31 (max batch size)
- **Region normalization**: O(16) - Small constant time
- **Total complexity**: Very efficient, no performance concerns

---

## 🐛 Debugging Tips

### User not getting expected story?
1. Check their region: `console.log('User region:', userRegion)`
2. Check starting batch: `console.log('Starting batch:', getStartingBatch(userRegion))`
3. Check batch sequence: `console.log('Sequence:', createBatchSequence(startingBatch))`
4. Check completed IDs: `console.log('Completed:', completedStoryIds)`

### Region not recognized?
- Check spelling (case-insensitive but must match keys in `STATE_BATCH_MAPPING`)
- Fallback: Unknown regions default to Batch 1

### User sees wrong story count?
- Verify all 9 batches are imported in `index.ts`
- Check `getTotalStoryCount()` returns 280
- Verify `allStories` array length

---

## 📝 Future Enhancements (Optional)

1. **Analytics Dashboard**: Show which regions are most active
2. **Progress by Batch**: Track completion rates per batch
3. **Regional Leaderboards**: Compare users within same starting batch
4. **Dynamic Distribution**: Adjust starting batches based on load
5. **A/B Testing**: Test different distribution strategies

---

**Quick Start**: Everything is implemented and ready to use! Just deploy and test with different regions. 🚀


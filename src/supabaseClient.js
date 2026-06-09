import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getBranchScore = (branchName) => {
  const b = String(branchName || '').toLowerCase();
  if (b.includes('civil')) return 1;
  if (b.includes('mechanical')) return 2;
  if (b.includes('electrical')) return 3;
  if (b.includes('electronics')) return 4;
  if (b.includes('computer') || b.includes('cs')) return 5;
  if (b.includes('information') || b.includes('it')) return 6;
  if (b.includes('agri')) return 7;
  if (b.includes('ai') || b.includes('machine')) return 8;
  if (b.includes('auto')) return 9;
  if (b.includes('textile')) return 10;
  if (b.includes('leather')) return 11;
  if (b.includes('ceramic')) return 12;
  if (b.includes('print')) return 13;
  if (b.includes('fire')) return 14;
  if (b.includes('mining')) return 15;
  return 99; // fallback
};

export const getCategorySortScore = (category) => {
  const cat = String(category || '').trim().toUpperCase();
  if (cat === 'UR' || cat === 'E-UR') return 1;
  if (cat === 'BC' || cat === 'E-BC') return 2;
  if (cat === 'EBC' || cat === 'E-EBC') return 3;
  if (cat === 'SC' || cat === 'E-SC') return 4;
  if (cat === 'ST' || cat === 'E-ST') return 5;
  if (cat === 'EWS') return 6;
  if (cat === 'RCG') return 7;
  return 8; // DQ, SMQ, others
};

export const fetchAndSortCutoffsParallel = async () => {
  try {
    // 1. Get exact count using a lightweight HEAD request
    const { count, error: countError } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn("Count query failed, falling back to sequential fetch:", countError.message);
    }

    let allData = [];

    if (count !== null && count !== undefined && count > 0) {
      const limit = 1000;
      const pages = Math.ceil(count / limit);
      const promises = [];

      for (let i = 0; i < pages; i++) {
        const from = i * limit;
        const to = from + limit - 1;
        promises.push(
          supabase
            .from('colleges')
            .select('*')
            .range(from, to)
            .order('id', { ascending: true })
        );
      }

      const results = await Promise.all(promises);
      for (const res of results) {
        if (res.error) throw res.error;
        if (res.data) {
          allData = [...allData, ...res.data];
        }
      }
    } else {
      // Fallback to sequential fetching
      let from = 0;
      let hasMore = true;
      const limit = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .range(from, from + limit - 1)
          .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < limit) {
            hasMore = false;
          } else {
            from += limit;
          }
        } else {
          hasMore = false;
        }
      }
    }

    // Sort allData by College -> Branch Score -> Category Score -> Closing Rank
    allData.sort((a, b) => {
      // 1. Sort by College Name
      const nameA = (a.college_name || '').trim().toLowerCase();
      const nameB = (b.college_name || '').trim().toLowerCase();
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }

      // 2. Sort by Branch Score
      const branchScoreA = getBranchScore(a.branch);
      const branchScoreB = getBranchScore(b.branch);
      if (branchScoreA !== branchScoreB) {
        return branchScoreA - branchScoreB;
      }

      // 3. Sort by Category Score (UR -> BC -> EBC -> etc.)
      const catScoreA = getCategorySortScore(a.category);
      const catScoreB = getCategorySortScore(b.category);
      if (catScoreA !== catScoreB) {
        return catScoreA - catScoreB;
      }

      // 4. Sort by Closing Rank
      return (a.closing_rank || 0) - (b.closing_rank || 0);
    });

    return allData;
  } catch (err) {
    console.error("Parallel fetch failed:", err);
    throw err;
  }
};
#include <algorithm>
#include <vector>

// Segment Tree with Lazy Propagation
struct SegTree {
    int n;
    std::vector<long long> tree_min;
    std::vector<long long> tree_max;
    std::vector<long long> lazy;

    // Initialize the segment tree size (1-based indexing requires up to 4*n nodes)
    SegTree(int n) : n(n), tree_min(4 * n + 1, 0), tree_max(4 * n + 1, 0), lazy(4 * n + 1, 0) {}

    // Pushes the pending updates down to the children
    void push_down(int v) {
        if (lazy[v] != 0) {
            lazy[2 * v] += lazy[v];
            tree_min[2 * v] += lazy[v];
            tree_max[2 * v] += lazy[v];

            lazy[2 * v + 1] += lazy[v];
            tree_min[2 * v + 1] += lazy[v];
            tree_max[2 * v + 1] += lazy[v];

            lazy[v] = 0;
        }
    }

    // Range addition update
    void update(int v, int tl, int tr, int l, int r, long long val) {
        if (l > r) return;
        if (l == tl && r == tr) {
            tree_min[v] += val;
            tree_max[v] += val;
            lazy[v] += val;
        } else {
            push_down(v);
            int tm = tl + (tr - tl) / 2;
            update(2 * v, tl, tm, l, std::min(r, tm), val);
            update(2 * v + 1, tm + 1, tr, std::max(l, tm + 1), r, val);
            tree_min[v] = std::min(tree_min[2 * v], tree_min[2 * v + 1]);
            tree_max[v] = std::max(tree_max[2 * v], tree_max[2 * v + 1]);
        }
    }

    // Range minimum query
    long long query_min(int v, int tl, int tr, int l, int r) {
        if (l > r) return 2e18; // Return "infinity" for out of bounds
        if (l == tl && r == tr) return tree_min[v];
        push_down(v);
        int tm = tl + (tr - tl) / 2;
        return std::min(query_min(2 * v, tl, tm, l, std::min(r, tm)),
                        query_min(2 * v + 1, tm + 1, tr, std::max(l, tm + 1), r));
    }

    // O(1) query for the global maximum element
    long long get_max() const {
        return tree_max[1];
    }
};

static Result solve(const InputData &D) {
    Result res;
    res.thresholdEvent = -1;
    
    // D.N represents the number of segments (M) in the provided stub
    SegTree st(D.N); 
    
    int event_index = 1;
    for (const Event &e : D.events) {
        if (e.kind == 'B') { // BOOK
            st.update(1, 1, D.N, e.l, e.r, e.p);
            
            // Track if global threshold is breached for the first time
            if (res.thresholdEvent == -1 && st.get_max() >= D.T) {
                res.thresholdEvent = event_index;
            }
        } else if (e.kind == 'Q') { // QUERY
            long long min_cost = st.query_min(1, 1, D.N, e.l, e.r);
            res.answers.push_back(min_cost);
        }
        event_index++;
    }
    
    return res;
}
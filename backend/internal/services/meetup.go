package services

import (
	"container/heap"
	"errors"
	"math"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
)

var (
	ErrUnknownLocation = errors.New("location not found in road network")
	ErrNoPathFound     = errors.New("no connecting route found between locations")
)

// RoadEdge represents a bidirectional weighted connection between two transit hubs
type RoadEdge struct {
	To     string
	Weight float64 // Distance in kilometers
}

// MeetupGraph represents the road network of Butwal transit hubs
type MeetupGraph struct {
	AdjacencyList map[string][]RoadEdge
	HubSafetyRank map[string]float64 // Public foot traffic / safe trading score (0.0 to 1.0)
	HubNames      map[string]string
}

// PriorityQueue item for Dijkstra's min-heap
type dijkstraItem struct {
	node     string
	distance float64
	index    int
}

type dijkstraPriorityQueue []*dijkstraItem

func (pq dijkstraPriorityQueue) Len() int           { return len(pq) }
func (pq dijkstraPriorityQueue) Less(i, j int) bool { return pq[i].distance < pq[j].distance }
func (pq dijkstraPriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}
func (pq *dijkstraPriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*dijkstraItem)
	item.index = n
	*pq = append(*pq, item)
}
func (pq *dijkstraPriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil
	item.index = -1
	*pq = old[0 : n-1]
	return item
}

// NewButwalRoadGraph initializes the graph of Butwal junctions with realistic road distances (in km)
func NewButwalRoadGraph() *MeetupGraph {
	g := &MeetupGraph{
		AdjacencyList: make(map[string][]RoadEdge),
		HubSafetyRank: make(map[string]float64),
		HubNames:      make(map[string]string),
	}

	for _, loc := range models.ButwalLocations {
		g.HubNames[loc.ID] = loc.Name
		// High safety score for prominent public junctions with heavy foot traffic
		switch loc.ID {
		case "traffic-chowk", "chauraha", "milanchowk", "golpark", "kalikanagar":
			g.HubSafetyRank[loc.ID] = 1.0
		case "devinagar", "yogikuti", "sukhanagar", "amarpath", "haatbazaar":
			g.HubSafetyRank[loc.ID] = 0.8
		default:
			g.HubSafetyRank[loc.ID] = 0.5
		}
	}

	// Helper to add bidirectional road edges
	addEdge := func(u, v string, dist float64) {
		g.AdjacencyList[u] = append(g.AdjacencyList[u], RoadEdge{To: v, Weight: dist})
		g.AdjacencyList[v] = append(g.AdjacencyList[v], RoadEdge{To: u, Weight: dist})
	}

	// Main Highway & arterial connections in Butwal
	addEdge("golpark", "traffic-chowk", 1.2)
	addEdge("traffic-chowk", "amarpath", 0.6)
	addEdge("amarpath", "haatbazaar", 0.7)
	addEdge("haatbazaar", "sukhanagar", 0.8)
	addEdge("traffic-chowk", "sukhanagar", 1.0)
	addEdge("sukhanagar", "milanchowk", 0.8)
	addEdge("milanchowk", "kalikanagar", 1.1)
	addEdge("kalikanagar", "chauraha", 1.0)
	addEdge("traffic-chowk", "chauraha", 2.5)

	// Southward corridor (towards Tilottama / Industrial area)
	addEdge("chauraha", "yogikuti", 1.5)
	addEdge("yogikuti", "drivertole", 1.8)
	addEdge("drivertole", "manigram", 2.2)

	// Westward corridor (Devinagar, Belbas, Tamnagar)
	addEdge("chauraha", "devinagar", 1.4)
	addEdge("kalikanagar", "devinagar", 1.2)
	addEdge("devinagar", "belbas", 2.5)
	addEdge("belbas", "tamnagar", 3.0)
	addEdge("tamnagar", "motipur", 3.5)
	addEdge("belbas", "semlar", 3.8)

	// Eastward & North-East (Deepnagar, Nayagaon)
	addEdge("golpark", "deepnagar", 1.8)
	addEdge("deepnagar", "nayagaon", 2.0)
	addEdge("milanchowk", "nayagaon", 1.9)

	return g
}

// DijkstraResult holds computed shortest distances and predecessors
type DijkstraResult struct {
	Distances map[string]float64
	Previous  map[string]string
}

// RunDijkstra executes Dijkstra's algorithm from a given source node
func (g *MeetupGraph) RunDijkstra(startNode string) (DijkstraResult, error) {
	if _, ok := g.HubNames[startNode]; !ok {
		return DijkstraResult{}, ErrUnknownLocation
	}

	distances := make(map[string]float64)
	previous := make(map[string]string)
	for node := range g.HubNames {
		distances[node] = math.Inf(1)
	}
	distances[startNode] = 0.0

	pq := &dijkstraPriorityQueue{}
	heap.Init(pq)
	heap.Push(pq, &dijkstraItem{node: startNode, distance: 0.0})

	visited := make(map[string]bool)

	for pq.Len() > 0 {
		current := heap.Pop(pq).(*dijkstraItem)
		u := current.node

		if visited[u] {
			continue
		}
		visited[u] = true

		for _, edge := range g.AdjacencyList[u] {
			v := edge.To
			if visited[v] {
				continue
			}

			newDist := distances[u] + edge.Weight
			if newDist < distances[v] {
				distances[v] = newDist
				previous[v] = u
				heap.Push(pq, &dijkstraItem{node: v, distance: newDist})
			}
		}
	}

	return DijkstraResult{
		Distances: distances,
		Previous:  previous,
	}, nil
}

// ReconstructPath traces the shortest path sequence from start to target
func (r *DijkstraResult) ReconstructPath(targetNode string) []string {
	var path []string
	curr := targetNode
	for curr != "" {
		path = append([]string{curr}, path...)
		curr = r.Previous[curr]
	}
	return path
}

// MeetupSuggestion holds the calculated optimal safe meeting point details
type MeetupSuggestion struct {
	HubID              string   `json:"hub_id"`
	HubName            string   `json:"hub_name"`
	BuyerDistanceKm    float64  `json:"buyer_distance_km"`
	SellerDistanceKm   float64  `json:"seller_distance_km"`
	TotalDistanceKm    float64  `json:"total_distance_km"`
	DistanceDiffKm     float64  `json:"distance_diff_km"`
	BuyerPath          []string `json:"buyer_path"`
	SellerPath         []string `json:"seller_path"`
	IsDesignatedSafeHub bool     `json:"is_designated_safe_hub"`
	Explanation        string   `json:"explanation"`
}

type MeetupService struct {
	graph *MeetupGraph
}

func NewMeetupService() *MeetupService {
	return &MeetupService{
		graph: NewButwalRoadGraph(),
	}
}

// ResolveLocationID normalizes any location string (ID or Name or Area) to a graph node ID
func (s *MeetupService) ResolveLocationID(input string) string {
	clean := strings.TrimSpace(input)
	if clean == "" {
		return "traffic-chowk"
	}

	lower := strings.ToLower(clean)
	for _, loc := range models.ButwalLocations {
		if loc.ID == lower || strings.ToLower(loc.Name) == lower || strings.ToLower(loc.Area) == lower {
			return loc.ID
		}
	}

	for _, loc := range models.ButwalLocations {
		if strings.Contains(lower, strings.ToLower(loc.Area)) || strings.Contains(lower, loc.ID) {
			return loc.ID
		}
	}

	return "traffic-chowk"
}

// SuggestOptimalMeetup uses Dijkstra from buyer and seller nodes to compute the optimal safe meetup hub
func (s *MeetupService) SuggestOptimalMeetup(buyerLocInput, sellerLocInput string) (*MeetupSuggestion, error) {
	buyerNode := s.ResolveLocationID(buyerLocInput)
	sellerNode := s.ResolveLocationID(sellerLocInput)

	buyerDijkstra, err := s.graph.RunDijkstra(buyerNode)
	if err != nil {
		return nil, err
	}

	sellerDijkstra, err := s.graph.RunDijkstra(sellerNode)
	if err != nil {
		return nil, err
	}

	// Objective Function Weights:
	// Cost = 1.0 * TotalDistance + 0.6 * FairnessDifference - 0.5 * SafetyBonus
	bestCost := math.Inf(1)
	bestHub := buyerNode

	for hubID := range s.graph.HubNames {
		bDist := buyerDijkstra.Distances[hubID]
		sDist := sellerDijkstra.Distances[hubID]

		if math.IsInf(bDist, 1) || math.IsInf(sDist, 1) {
			continue
		}

		totalDist := bDist + sDist
		diffDist := math.Abs(bDist - sDist)
		safetyBonus := s.graph.HubSafetyRank[hubID] * 0.8

		cost := totalDist + (0.6 * diffDist) - safetyBonus
		if cost < bestCost {
			bestCost = cost
			bestHub = hubID
		}
	}

	buyerPath := buyerDijkstra.ReconstructPath(bestHub)
	sellerPath := sellerDijkstra.ReconstructPath(bestHub)

	bDist := math.Round(buyerDijkstra.Distances[bestHub]*10) / 10
	sDist := math.Round(sellerDijkstra.Distances[bestHub]*10) / 10
	totDist := math.Round((bDist+sDist)*10) / 10
	diffDist := math.Round(math.Abs(bDist-sDist)*10) / 10

	hubName := s.graph.HubNames[bestHub]
	isSafe := s.graph.HubSafetyRank[bestHub] >= 0.8

	explanation := "Optimal central junction with balanced travel distance and high public visibility for safe exchange."
	if buyerNode == sellerNode {
		explanation = "Both buyer and seller are located in the same area. The meetup is recommended right at this neighborhood center."
	}

	return &MeetupSuggestion{
		HubID:               bestHub,
		HubName:             hubName,
		BuyerDistanceKm:     bDist,
		SellerDistanceKm:    sDist,
		TotalDistanceKm:     totDist,
		DistanceDiffKm:      diffDist,
		BuyerPath:           buyerPath,
		SellerPath:          sellerPath,
		IsDesignatedSafeHub: isSafe,
		Explanation:         explanation,
	}, nil
}

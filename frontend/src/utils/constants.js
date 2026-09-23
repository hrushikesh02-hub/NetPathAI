export const PROTOCOLS = [
  { id: 'TCP', name: 'Transmission Control Protocol (TCP)', type: 'Transport', reliable: true, defaultPort: 80 },
  { id: 'UDP', name: 'User Datagram Protocol (UDP)', type: 'Transport', reliable: false, defaultPort: 53 }
];

export const APP_PROTOCOLS = [
  { id: 'HTTP', name: 'HTTP (Hypertext Transfer Protocol)', port: 80, transport: 'TCP', desc: 'Web request/response communication' },
  { id: 'HTTPS', name: 'HTTPS (HTTP Secure / TLS)', port: 443, transport: 'TCP', desc: 'Encrypted web traffic' },
  { id: 'DNS', name: 'DNS (Domain Name System)', port: 53, transport: 'UDP/TCP', desc: 'Domain name resolution to IP' },
  { id: 'FTP', name: 'FTP (File Transfer Protocol)', port: 21, transport: 'TCP', desc: 'Bulk file uploading and downloading' },
  { id: 'SMTP', name: 'SMTP (Simple Mail Transfer)', port: 25, transport: 'TCP', desc: 'Electronic mail routing and delivery' },
  { id: 'DHCP', name: 'DHCP (Dynamic Host Config)', port: 67, transport: 'UDP', desc: 'Automatic IP address assignment' }
];

export const DEFAULT_PACKET = {
  source_node: 'PC1',
  destination_node: 'Server1',
  source_ip: '192.168.1.10',
  destination_ip: '192.168.2.20',
  source_mac: '00:1A:2B:3C:4D:5E',
  destination_mac: '00:1A:2B:3C:99:AA',
  source_port: 5000,
  destination_port: 80,
  protocol: 'TCP',
  app_protocol: 'HTTP',
  payload: 'HELLO SERVER',
  packet_size: 1024,
  ttl: 64
};

export const SYLLABUS_MODULES = [
  {
    unit: 'UNIT I',
    title: 'Physical & Data Link Architecture',
    topics: ['LAN / WAN Topologies', 'OSI 7-Layer Reference Model', 'TCP/IP 4-Layer Architecture', 'Hubs, Switches, Routers & APs', 'Transmission Media & Modulation'],
    relevance: 'Visualized in Layer Stack Visualizer and Interactive Topology Graph.'
  },
  {
    unit: 'UNIT II',
    title: 'Data Link Layer & Framing',
    topics: ['Ethernet Framing (IEEE 802.3)', 'MAC Addressing & NICs', 'Error Detection (CRC32/FCS)', 'Flow Control & Sliding Window', 'CSMA/CD Media Access'],
    relevance: 'Demonstrated in Layer 2 encapsulation, FCS calculation, and hop-by-hop MAC updates.'
  },
  {
    unit: 'UNIT III',
    title: 'Network Layer & Routing',
    topics: ['IPv4 Addressing & Subnetting', 'TTL & Packet Lifecycles', 'Dijkstra Shortest Path Algorithm', 'Link State Routing & Failover', 'Congestion & QoS Concepts'],
    relevance: 'Simulated via Dijkstra pathfinding, TTL decrements, and automated Core Router failure rerouting.'
  },
  {
    unit: 'UNIT IV',
    title: 'Transport Layer Reliability',
    topics: ['TCP 3-Way Handshake & Segments', 'UDP Connectionless Datagrams', 'Port Multiplexing (Sockets)', 'TCP Retransmissions & RTO', 'Congestion Window Backoff'],
    relevance: 'Demonstrated in Packet Loss simulation, TCP retransmission triggers, and segment encapsulation.'
  },
  {
    unit: 'UNIT V',
    title: 'Application Protocols & Network Intelligence',
    topics: ['HTTP, DNS, FTP, SMTP, DHCP', 'Performance Metrics: Latency, Jitter, Throughput', 'Machine Learning Telemetry Analysis', 'Isolation Forest Anomaly Detection'],
    relevance: 'Core AI module feature evaluating QoS telemetry and generating engineering recommendations.'
  }
];

"""
OSI & TCP/IP Encapsulation and Decapsulation Engine.
Generates structured layer headers, checksums, binary bitstreams, and stage traces.
"""

from typing import Dict, Any, List
import binascii
import zlib

class EncapsulationEngine:
    @staticmethod
    def calculate_checksum(data: str) -> str:
        """Simulates CRC32 / 16-bit checksum."""
        crc = zlib.crc32(data.encode('utf-8'))
        return f"0x{crc & 0xFFFFFFFF:08X}"

    @staticmethod
    def text_to_binary(text: str, max_bits: int = 64) -> str:
        """Converts text payload into a representative binary string."""
        binary_chunks = [format(ord(char), '08b') for char in text[:8]]
        bitstream = " ".join(binary_chunks)
        if len(text) > 8:
            bitstream += " ... (truncated)"
        return bitstream

    @classmethod
    def generate_layers(cls, packet_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates full 7-Layer OSI & 4-Layer TCP/IP representation with
        encapsulated PDU structures and decapsulation order.
        """
        payload = str(packet_data.get("payload", "HELLO SERVER"))
        app_proto = packet_data.get("app_protocol", "HTTP").upper()
        trans_proto = packet_data.get("protocol", "TCP").upper()
        src_ip = packet_data.get("source_ip", "192.168.1.10")
        dst_ip = packet_data.get("destination_ip", "192.168.2.20")
        src_port = int(packet_data.get("source_port", 5000))
        dst_port = int(packet_data.get("destination_port", 80))
        src_mac = packet_data.get("source_mac", "00:1A:2B:3C:4D:5E")
        dst_mac = packet_data.get("destination_mac", "00:50:56:C0:00:01")
        ttl = int(packet_data.get("ttl", 64))
        packet_size = int(packet_data.get("packet_size", len(payload.encode('utf-8')) + 54))

        # 7 OSI Layers Breakdown
        osi_layers = {
            7: {
                "layer_number": 7,
                "name": "Application",
                "tcpip_equivalent": "Application",
                "pdu_name": "Data / Message",
                "protocol": app_proto,
                "description": f"Provides network services directly to user applications ({app_proto} request formatting).",
                "header_data": {
                    "Protocol": app_proto,
                    "Payload": payload,
                    "Payload Length": f"{len(payload.encode('utf-8'))} bytes",
                    "Encoding": "UTF-8 / ASCII",
                    "Method/Opcode": "GET / HTTP/1.1" if app_proto == "HTTP" else ("QUERY (Type A)" if app_proto == "DNS" else "COMMAND")
                },
                "encapsulation_label": f"[{app_proto} DATA: \"{payload[:20]}\"]"
            },
            6: {
                "layer_number": 6,
                "name": "Presentation",
                "tcpip_equivalent": "Application",
                "pdu_name": "Formatted Data",
                "protocol": "MIME / TLS / ASCII",
                "description": "Handles syntax, encryption, data serialization, and compression.",
                "header_data": {
                    "Data Representation": "Standard Network Byte Order (Big-Endian)",
                    "Encryption": "TLS 1.3 / Plaintext",
                    "Compression": "Gzip / None",
                    "Character Set": "UTF-8"
                },
                "encapsulation_label": f"[PRESENTATION ENCODING | {app_proto} DATA]"
            },
            5: {
                "layer_number": 5,
                "name": "Session",
                "tcpip_equivalent": "Application",
                "pdu_name": "Session Token",
                "protocol": "Sockets / RPC / NetBIOS",
                "description": "Establishes, manages, and terminates dialogs and persistent connections between processes.",
                "header_data": {
                    "Session ID": f"0x{zlib.crc32(payload.encode('utf-8')) % 100000:05d}",
                    "Dialog Mode": "Full-Duplex",
                    "State": "ESTABLISHED / SYNCHRONIZED",
                    "Keep-Alive Interval": "60s"
                },
                "encapsulation_label": f"[SESSION TOKEN | {app_proto} DATA]"
            },
            4: {
                "layer_number": 4,
                "name": "Transport",
                "tcpip_equivalent": "Transport",
                "pdu_name": "Segment (TCP) / Datagram (UDP)",
                "protocol": trans_proto,
                "description": f"End-to-end communication, port multiplexing, reliability ({trans_proto} flow & error control).",
                "header_data": {
                    "Source Port": src_port,
                    "Destination Port": dst_port,
                    "Sequence Number": 1001 if trans_proto == "TCP" else "N/A",
                    "Acknowledgment Number": 2001 if trans_proto == "TCP" else "N/A",
                    "Flags": "SYN, ACK, PSH" if trans_proto == "TCP" else "None",
                    "Window Size": "65535 bytes" if trans_proto == "TCP" else "N/A",
                    "Checksum": cls.calculate_checksum(f"{src_port}{dst_port}{payload}")
                },
                "encapsulation_label": f"[{trans_proto} HDR: {src_port} \u2192 {dst_port}] + [DATA]"
            },
            3: {
                "layer_number": 3,
                "name": "Network",
                "tcpip_equivalent": "Internet",
                "pdu_name": "Packet",
                "protocol": "IPv4",
                "description": "Logical addressing, subnet routing, and packet forwarding across autonomous networks.",
                "header_data": {
                    "Version": "IPv4 (Version 4)",
                    "Header Length (IHL)": "20 Bytes (5 words)",
                    "Source IP": src_ip,
                    "Destination IP": dst_ip,
                    "TTL (Time to Live)": ttl,
                    "Protocol Number": "6 (TCP)" if trans_proto == "TCP" else "17 (UDP)",
                    "Header Checksum": cls.calculate_checksum(f"{src_ip}{dst_ip}{ttl}"),
                    "Total Length": f"{packet_size} Bytes"
                },
                "encapsulation_label": f"[IP HDR: {src_ip} \u2192 {dst_ip}] + [TCP HDR] + [DATA]"
            },
            2: {
                "layer_number": 2,
                "name": "Data Link",
                "tcpip_equivalent": "Network Access",
                "pdu_name": "Frame",
                "protocol": "Ethernet II (IEEE 802.3)",
                "description": "Physical MAC addressing, framing, media access control (CSMA/CD), and CRC error detection.",
                "header_data": {
                    "Preamble & SFD": "7 bytes (0xAA) + 1 byte (0xAB)",
                    "Destination MAC": dst_mac,
                    "Source MAC": src_mac,
                    "EtherType": "0x0800 (IPv4)",
                    "Frame Check Sequence (FCS/CRC)": cls.calculate_checksum(f"{src_mac}{dst_mac}")
                },
                "encapsulation_label": f"[ETH HDR: {src_mac} \u2192 {dst_mac}] + [IP HDR] + [TCP HDR] + [DATA] + [FCS]"
            },
            1: {
                "layer_number": 1,
                "name": "Physical",
                "tcpip_equivalent": "Network Access",
                "pdu_name": "Bitstream (Signals)",
                "protocol": "1000BASE-T / Optical / 802.11 Wi-Fi",
                "description": "Transmission of raw unstructured bitstreams over physical copper wires, fiber optics, or radio frequencies.",
                "header_data": {
                    "Signaling": "Manchester / PAM-5 Encoding",
                    "Bitstream Sample": cls.text_to_binary(payload),
                    "Bitrate": "1 Gbps / 1000 Mbps",
                    "Voltage / Modulation": "+0.85V to -0.85V (Differential signaling)",
                    "Transmission Medium": "Twisted Pair Cat6 (UTP)"
                },
                "encapsulation_label": f"01010100 01100011 01110000 00100000 ... [RAW BITS]"
            }
        }

        # Step-by-step encapsulation progression
        encapsulation_steps = [
            {
                "step": 1,
                "layer": "Application (L7)",
                "action": "Creation of User Data / Payload",
                "visual": f"| {payload} |"
            },
            {
                "step": 2,
                "layer": "Transport (L4)",
                "action": f"Adding {trans_proto} Header (Ports: {src_port} \u2192 {dst_port})",
                "visual": f"[{trans_proto} Hdr] + | {payload} |"
            },
            {
                "step": 3,
                "layer": "Network (L3)",
                "action": f"Adding IPv4 Header (IPs: {src_ip} \u2192 {dst_ip}, TTL: {ttl})",
                "visual": f"[IPv4 Hdr] + [{trans_proto} Hdr] + | {payload} |"
            },
            {
                "step": 4,
                "layer": "Data Link (L2)",
                "action": f"Adding Ethernet Frame Header (MAC: {src_mac} \u2192 {dst_mac}) & FCS Trailer",
                "visual": f"[Eth Hdr] + [IPv4 Hdr] + [{trans_proto} Hdr] + | {payload} | + [CRC/FCS]"
            },
            {
                "step": 5,
                "layer": "Physical (L1)",
                "action": "Modulation into Electrical/Optical Bitstream Signals",
                "visual": cls.text_to_binary(payload)
            }
        ]

        # Decapsulation steps at Destination
        decapsulation_steps = [
            {
                "step": 1,
                "layer": "Physical (L1)",
                "action": "Demodulating incoming electrical pulses into binary frame",
                "visual": "Signal Pulses \u2192 Raw Ethernet Frame"
            },
            {
                "step": 2,
                "layer": "Data Link (L2)",
                "action": "Validating Destination MAC & FCS Checksum, Stripping Ethernet Header",
                "visual": "Verified MAC match -> Stripping [Eth Hdr] & [FCS]"
            },
            {
                "step": 3,
                "layer": "Network (L3)",
                "action": "Verifying Destination IP match & Decrementing TTL, Stripping IPv4 Header",
                "visual": f"Verified IP {dst_ip} -> Stripping [IPv4 Hdr]"
            },
            {
                "step": 4,
                "layer": "Transport (L4)",
                "action": f"Delivering Segment to Destination Port {dst_port}, Stripping {trans_proto} Header",
                "visual": f"Port {dst_port} Socket Ready -> Stripping [{trans_proto} Hdr]"
            },
            {
                "step": 5,
                "layer": "Application (L7)",
                "action": f"Application consumes payload: \"{payload}\"",
                "visual": f"App Data Delivered: \"{payload}\""
            }
        ]

        return {
            "osi_layers": osi_layers,
            "encapsulation_steps": encapsulation_steps,
            "decapsulation_steps": decapsulation_steps,
            "hex_dump": binascii.hexlify(payload.encode('utf-8')).decode('ascii').upper()
        }

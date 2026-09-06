"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

type Coordinate = { latitude: number; longitude: number };

export function DeliveryLocationMap({ token, coordinate, onChange }: {
	token: string;
	coordinate: Coordinate;
	onChange: (coordinate: Coordinate) => void;
}) {
	const container = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markerRef = useRef<mapboxgl.Marker | null>(null);
	const onChangeRef = useRef(onChange);
	const initialCoordinate = useRef(coordinate);

	useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

	useEffect(() => {
		if (!container.current || mapRef.current) return;
		mapboxgl.accessToken = token;
		const map = new mapboxgl.Map({ container: container.current, style: "mapbox://styles/mapbox/streets-v12", center: [initialCoordinate.current.longitude, initialCoordinate.current.latitude], zoom: 16 });
		const marker = new mapboxgl.Marker({ draggable: true }).setLngLat([initialCoordinate.current.longitude, initialCoordinate.current.latitude]).addTo(map);
		marker.on("dragend", () => {
			const point = marker.getLngLat();
			onChangeRef.current({ latitude: point.lat, longitude: point.lng });
		});
		mapRef.current = map;
		markerRef.current = marker;
		return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
	}, [token]);

	useEffect(() => {
		const map = mapRef.current;
		const marker = markerRef.current;
		if (!map || !marker) return;
		const current = marker.getLngLat();
		if (Math.abs(current.lat - coordinate.latitude) < 0.000001 && Math.abs(current.lng - coordinate.longitude) < 0.000001) return;
		marker.setLngLat([coordinate.longitude, coordinate.latitude]);
		map.flyTo({ center: [coordinate.longitude, coordinate.latitude], essential: true });
	}, [coordinate.latitude, coordinate.longitude]);

	return <div ref={container} className="delivery-location-map" aria-label="Delivery location map" />;
}

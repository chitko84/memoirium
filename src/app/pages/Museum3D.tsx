import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Cuboid, DoorOpen, Eye, Heart, Images, MapPin, Monitor, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { getUserMemories } from "../services/memories";
import { getUserCollections } from "../services/collections";
import type { Collection, Memory } from "../types/memoirium";

type Museum3DRoom = {
  id: string;
  title: string;
  curatorNote: string;
  memories: Memory[];
};

const MAX_3D_FRAMES = 18;

function formatDate(value: string | null) {
  if (!value) return "Date not set";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function storyPreview(story: string) {
  if (story.length <= 220) return story;
  return `${story.slice(0, 217)}...`;
}

function buildMuseumRooms(collections: Collection[], memories: Memory[]) {
  const rooms = collections.map<Museum3DRoom>((collection) => {
    const roomMemories = memories.filter((memory) => memory.collection_id === collection.id);

    return {
      id: collection.id,
      title: collection.title,
      curatorNote: collection.curator_note || collection.description || "A curated exhibition room in your 3D museum.",
      memories: roomMemories,
    };
  });
  const assignedCollectionIds = new Set(collections.map((collection) => collection.id));
  const unassignedMemories = memories.filter(
    (memory) => !memory.collection_id || !assignedCollectionIds.has(memory.collection_id),
  );

  if (unassignedMemories.length > 0) {
    rooms.push({
      id: "unassigned",
      title: "Unassigned Artifacts",
      curatorNote: "Memory artifacts not yet installed in a dedicated exhibition room.",
      memories: unassignedMemories,
    });
  }

  if (rooms.length === 0 && memories.length > 0) {
    return [
      {
        id: "all-memories",
        title: "Memory Archive",
        curatorNote: "A temporary 3D room for all memory artifacts.",
        memories,
      },
    ];
  }

  return rooms;
}

function getFramePlacement(index: number) {
  const wallIndex = index % 3;
  const row = Math.floor(index / 3);
  const slot = row % 4;
  const y = row > 3 ? 3.25 : 1.55;

  if (wallIndex === 0) {
    return { position: [-3.6 + slot * 2.4, y, -5.86] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };
  }

  if (wallIndex === 1) {
    return {
      position: [-5.86, y, -4.3 + slot * 2.35] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
    };
  }

  return {
    position: [5.86, y, -4.3 + slot * 2.35] as [number, number, number],
    rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  };
}

function getTourCameraTarget(index: number) {
  const placement = getFramePlacement(index);
  const [x, y, z] = placement.position;
  const [, rotationY] = placement.rotation;

  if (rotationY === Math.PI / 2) {
    return {
      cameraPosition: new THREE.Vector3(-3.15, y + 0.18, z),
      target: new THREE.Vector3(x, y, z),
    };
  }

  if (rotationY === -Math.PI / 2) {
    return {
      cameraPosition: new THREE.Vector3(3.15, y + 0.18, z),
      target: new THREE.Vector3(x, y, z),
    };
  }

  return {
    cameraPosition: new THREE.Vector3(x, y + 0.18, -3.1),
    target: new THREE.Vector3(x, y, z),
  };
}

function CameraTourFocus({
  activeFrameIndex,
  controlsRef,
}: {
  activeFrameIndex: number | null;
  controlsRef: MutableRefObject<any>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (activeFrameIndex === null) return;

    const { cameraPosition, target } = getTourCameraTarget(activeFrameIndex);
    camera.position.lerp(cameraPosition, 0.075);

    if (controlsRef.current?.target) {
      controlsRef.current.target.lerp(target, 0.085);
      controlsRef.current.update();
    } else {
      camera.lookAt(target);
    }
  });

  return null;
}

type TextureStatus = "idle" | "loading" | "loaded" | "missing" | "error";

function getValidImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

function useImageTexture(memoryTitle: string, imageUrl: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [status, setStatus] = useState<TextureStatus>("idle");

  useEffect(() => {
    setTexture((current) => {
      current?.dispose();
      return null;
    });

    if (!imageUrl) {
      console.warn("Museum3D memory has no image_url", memoryTitle);
      setStatus("missing");
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    setStatus("loading");

    const loadedTexture = loader.load(
      imageUrl,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }

        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;
        loaded.minFilter = THREE.LinearMipmapLinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.wrapS = THREE.ClampToEdgeWrapping;
        loaded.wrapT = THREE.ClampToEdgeWrapping;
        loaded.needsUpdate = true;
        setTexture(loaded);
        setStatus("loaded");
      },
      undefined,
      (loadError) => {
        if (cancelled) return;

        console.warn("Museum3D texture load failed", memoryTitle, imageUrl, loadError);
        setTexture(null);
        setStatus("error");
      },
    );

    return () => {
      cancelled = true;
      loadedTexture.dispose();
      setTexture((current) => {
        current?.dispose();
        return null;
      });
    };
  }, [imageUrl, memoryTitle]);

  return { texture, status };
}

function getTextureAspect(texture: THREE.Texture | null) {
  const image = texture?.image as { width?: number; height?: number } | undefined;

  if (!image?.width || !image.height) {
    return 1.62 / 1.1;
  }

  return image.width / image.height;
}

function ArtifactFrame({
  memory,
  position,
  rotation,
  onSelect,
  isHighlighted,
}: {
  memory: Memory;
  position: [number, number, number];
  rotation: [number, number, number];
  onSelect: (memory: Memory) => void;
  isHighlighted: boolean;
}) {
  const imageUrl = getValidImageUrl(memory.image_url);
  const { texture, status } = useImageTexture(memory.title, imageUrl);
  const showFallback = !texture && status !== "loading";
  const imageAspect = getTextureAspect(texture);
  const imageHeight = imageAspect >= 1.62 / 1.1 ? 1.62 / imageAspect : 1.1;
  const imageWidth = imageAspect >= 1.62 / 1.1 ? 1.62 : 1.1 * imageAspect;
  const frameEmissive = isHighlighted ? "#d4af37" : "#000000";
  const frameEmissiveIntensity = isHighlighted ? 0.18 : 0;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 1.56, 0.12]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive={frameEmissive}
          emissiveIntensity={frameEmissiveIntensity}
          metalness={0.78}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.095]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 1.28, 0.06]} />
        <meshStandardMaterial color="#1a1820" emissive="#0a0806" emissiveIntensity={0.2} roughness={0.58} />
      </mesh>
      <mesh
        position={[0, 0.12, 0.18]}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onSelect(memory);
        }}
      >
        <planeGeometry args={[texture ? imageWidth : 1.62, texture ? imageHeight : 1.1]} />
        {texture ? (
          <meshBasicMaterial key={imageUrl ?? memory.id} map={texture} toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial color="#11131a" side={THREE.DoubleSide} />
        )}
      </mesh>
      {showFallback && (
        <group position={[0, 0.12, 0.205]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.5, 0.98]} />
            <meshStandardMaterial color="#151820" emissive="#050609" emissiveIntensity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <lineSegments position={[0, 0, 0.005]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.5, 0.98)]} />
            <lineBasicMaterial color="#d4af37" />
          </lineSegments>
          <Text position={[0, 0.16, 0.02]} fontSize={0.12} color="#d4af37" anchorX="center" anchorY="middle" maxWidth={1.2}>
            Image unavailable
          </Text>
          <Text position={[0, -0.08, 0.02]} fontSize={0.085} color="#f4e4bc" anchorX="center" anchorY="middle" maxWidth={1.18}>
            {memory.title}
          </Text>
        </group>
      )}
      <mesh position={[0, -0.72, 0.13]} castShadow>
        <boxGeometry args={[1.44, 0.24, 0.035]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.55} />
      </mesh>
      <Text position={[0, -0.72, 0.16]} fontSize={0.09} color="#f4e4bc" anchorX="center" anchorY="middle" maxWidth={1.24}>
        {memory.title}
      </Text>
    </group>
  );
}

function MuseumRoom({
  roomTitle,
  memories,
  activeFrameIndex,
  onSelectMemory,
}: {
  roomTitle: string;
  memories: Memory[];
  activeFrameIndex: number | null;
  onSelectMemory: (memory: Memory) => void;
}) {
  const controlsRef = useRef<any>(null);
  const displayedMemories = memories.slice(0, MAX_3D_FRAMES);

  return (
    <>
      <color attach="background" args={["#050609"]} />
      <fog attach="fog" args={["#050609", 8, 18]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 4.6, 1.5]} intensity={42} color="#f4e4bc" castShadow />
      <pointLight position={[-4.8, 3.2, -3.8]} intensity={14} color="#d4af37" />
      <pointLight position={[4.8, 3.2, -3.8]} intensity={14} color="#d4af37" />
      <spotLight position={[0, 5, 4.5]} angle={0.48} penumbra={0.9} intensity={48} color="#f4e4bc" castShadow />

      {displayedMemories.slice(0, 9).map((memory, index) => {
        const placement = getFramePlacement(index);
        const [x, y, z] = placement.position;

        return (
          <pointLight
            key={`spot-${memory.id}`}
            position={[x, y + 1.55, z + (Math.abs(z) > 5 ? 1.2 : 0)]}
            intensity={6}
            distance={2.8}
            color="#f4e4bc"
          />
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#101217" roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, -1.1]}>
        <planeGeometry args={[8.4, 7.2]} />
        <meshStandardMaterial color="#d4af37" metalness={0.52} roughness={0.18} transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, 2.25, -6]} receiveShadow>
        <boxGeometry args={[12, 4.5, 0.12]} />
        <meshStandardMaterial color="#14161d" roughness={0.72} />
      </mesh>
      <mesh position={[0, 2.25, -5.88]} receiveShadow>
        <boxGeometry args={[10.8, 3.75, 0.1]} />
        <meshStandardMaterial color="#181b23" roughness={0.68} />
      </mesh>
      <mesh position={[-6, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.5, 12]} />
        <meshStandardMaterial color="#11131a" roughness={0.72} />
      </mesh>
      <mesh position={[-5.88, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3.75, 10.8]} />
        <meshStandardMaterial color="#171922" roughness={0.68} />
      </mesh>
      <mesh position={[6, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.5, 12]} />
        <meshStandardMaterial color="#11131a" roughness={0.72} />
      </mesh>
      <mesh position={[5.88, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3.75, 10.8]} />
        <meshStandardMaterial color="#171922" roughness={0.68} />
      </mesh>
      <mesh position={[0, 4.52, 0]}>
        <boxGeometry args={[12, 0.12, 12]} />
        <meshStandardMaterial color="#08090d" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 5.4, 4]} />
        <meshStandardMaterial color="#d4af37" metalness={0.35} roughness={0.45} transparent opacity={0.18} />
      </mesh>
      <group position={[0, 1.68, -5.78]}>
        <mesh position={[0, 0.65, 0.08]}>
          <torusGeometry args={[1.15, 0.045, 12, 48, Math.PI]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.24} />
        </mesh>
        <mesh position={[-1.15, -0.28, 0.08]}>
          <boxGeometry args={[0.09, 1.85, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.24} />
        </mesh>
        <mesh position={[1.15, -0.28, 0.08]}>
          <boxGeometry args={[0.09, 1.85, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.24} />
        </mesh>
        <mesh position={[0, -1.22, 0.07]}>
          <boxGeometry args={[2.5, 0.08, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.24} />
        </mesh>
      </group>
      <Text position={[0, 3.82, -5.72]} fontSize={0.24} color="#d4af37" anchorX="center" anchorY="middle" maxWidth={4.8}>
        {roomTitle}
      </Text>

      {Array.from({ length: 26 }).map((_, index) => (
        <mesh
          key={`particle-${index}`}
          position={[((index * 1.73) % 9) - 4.5, 1.1 + (index % 7) * 0.38, -5 + ((index * 2.11) % 8)]}
        >
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.4} transparent opacity={0.42} />
        </mesh>
      ))}

      {displayedMemories.map((memory, index) => {
        const placement = getFramePlacement(index);

        return (
          <ArtifactFrame
            key={memory.id}
            memory={memory}
            position={placement.position}
            rotation={placement.rotation}
            isHighlighted={activeFrameIndex === index}
            onSelect={onSelectMemory}
          />
        );
      })}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.2}
        maxDistance={10}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.7, -2.4]}
        makeDefault
      />
      <CameraTourFocus activeFrameIndex={activeFrameIndex} controlsRef={controlsRef} />
    </>
  );
}

function MemoryOverlay({
  memory,
  onClose,
  onViewFull,
}: {
  memory: Memory;
  onClose: () => void;
  onViewFull: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--gold-primary)]/35 bg-[var(--surface)]"
        style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.68)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-[var(--border)] bg-black/55 p-2 text-[var(--text-primary)] hover:text-[var(--gold-primary)]"
          aria-label="Close artifact preview"
        >
          <X size={20} />
        </button>
        <div className="grid max-h-[86vh] overflow-y-auto lg:grid-cols-[1fr_1fr]">
          <div className="min-h-72 bg-[var(--surface-light)]">
            {memory.image_url ? (
              <img src={memory.image_url} alt={memory.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center">
                <Images size={52} className="text-[var(--gold-primary)]/60" />
              </div>
            )}
          </div>
          <div className="p-7">
            <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--text-secondary)]">3D Museum Artifact</p>
            <h2 className="text-4xl mb-5 text-[var(--gold-primary)]">{memory.title}</h2>
            <div className="mb-6 space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[var(--gold-primary)]" />
                {formatDate(memory.memory_date)}
              </div>
              {memory.emotion && (
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-[var(--gold-primary)]" />
                  {memory.emotion}
                </div>
              )}
              {memory.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--gold-primary)]" />
                  {memory.location}
                </div>
              )}
            </div>
            <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">{storyPreview(memory.story)}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" onClick={onViewFull}>
                <Eye size={18} />
                View Full Artifact
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Guided3DTourOverlay({
  memory,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onEnd,
  onViewFull,
}: {
  memory: Memory;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onEnd: () => void;
  onViewFull: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[135] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto mx-auto max-w-4xl rounded-lg border border-[var(--gold-primary)]/40 bg-[var(--surface)]/95 p-5 backdrop-blur"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.68)" }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Guided 3D Tour {currentStep} / {totalSteps}
            </p>
            <h2 className="text-2xl text-[var(--gold-primary)]">{memory.title}</h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} className="text-[var(--gold-primary)]" />
                {formatDate(memory.memory_date)}
              </span>
              {memory.emotion && (
                <span className="inline-flex items-center gap-2">
                  <Heart size={15} className="text-[var(--gold-primary)]" />
                  {memory.emotion}
                </span>
              )}
              {memory.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-[var(--gold-primary)]" />
                  {memory.location}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{storyPreview(memory.story)}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button variant="outline" size="sm" onClick={onPrevious} disabled={totalSteps <= 1}>
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={onNext} disabled={totalSteps <= 1}>
              Next
              <ChevronRight size={16} />
            </Button>
            <Button variant="primary" size="sm" onClick={onViewFull}>
              <Eye size={16} />
              View Full
            </Button>
            <Button variant="outline" size="sm" onClick={onEnd}>
              End Tour
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Museum3D() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [isRoomTransitioning, setIsRoomTransitioning] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const rooms = useMemo(() => buildMuseumRooms(collections, memories), [collections, memories]);
  const currentRoom = rooms[roomIndex] ?? rooms[0] ?? null;
  const installedMemories = useMemo(() => currentRoom?.memories.slice(0, MAX_3D_FRAMES) ?? [], [currentRoom]);
  const tourMemory = tourIndex === null ? null : installedMemories[tourIndex] ?? null;

  useEffect(() => {
    const loadMemories = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const [collectionData, memoryData] = await Promise.all([
          getUserCollections(user.id),
          getUserMemories(user.id),
        ]);

        setCollections(collectionData);
        setMemories(memoryData);
        setRoomIndex(0);
        setTourIndex(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to open the 3D museum.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMemories();
  }, [user]);

  useEffect(() => {
    if (roomIndex > Math.max(rooms.length - 1, 0)) {
      setRoomIndex(0);
    }
  }, [roomIndex, rooms.length]);

  useEffect(() => {
    if (tourIndex !== null && tourIndex > Math.max(installedMemories.length - 1, 0)) {
      setTourIndex(installedMemories.length > 0 ? installedMemories.length - 1 : null);
    }
  }, [installedMemories.length, tourIndex]);

  const changeRoom = (nextIndex: number) => {
    if (rooms.length === 0) return;

    const normalizedIndex = (nextIndex + rooms.length) % rooms.length;
    setIsRoomTransitioning(true);
    window.setTimeout(() => {
      setSelectedMemory(null);
      setTourIndex(null);
      setRoomIndex(normalizedIndex);
      window.setTimeout(() => setIsRoomTransitioning(false), 180);
    }, 160);
  };

  const goToPreviousRoom = () => changeRoom(roomIndex - 1);
  const goToNextRoom = () => changeRoom(roomIndex + 1);
  const startTour = () => {
    if (installedMemories.length === 0) return;
    setSelectedMemory(null);
    setTourIndex(0);
  };
  const goToPreviousArtifact = () => {
    setTourIndex((current) => {
      if (current === null || installedMemories.length === 0) return current;
      return current === 0 ? installedMemories.length - 1 : current - 1;
    });
  };
  const goToNextArtifact = () => {
    setTourIndex((current) => {
      if (current === null || installedMemories.length === 0) return current;
      return current === installedMemories.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 mt-16 overflow-hidden">
          <section className="px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="mb-4 inline-flex items-center gap-2 border border-[var(--gold-primary)]/25 bg-[var(--surface)] px-4 py-2 text-sm text-[var(--gold-secondary)]">
                  <Cuboid size={16} />
                  Experimental True 3D Wing
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-5xl mb-3 text-[var(--gold-primary)]">3D Museum</h1>
                    <p className="max-w-2xl text-[var(--text-secondary)]">
                      Navigate exhibition rooms as true 3D museum spaces with smooth orbit controls.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--gold-primary)]/25 bg-black/25 px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {rooms.length} {rooms.length === 1 ? "room" : "rooms"} installed
                  </div>
                </div>
              </motion.div>

              {isLoading && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                  <Cuboid size={36} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                  <p className="text-[var(--gold-primary)]">Constructing the 3D museum room...</p>
                </div>
              )}

              {!isLoading && error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                  <p className="mb-6 text-red-200">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}

              {!isLoading && !error && memories.length === 0 && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                  <Images size={42} className="mx-auto mb-5 text-[var(--gold-primary)]" />
                  <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No artifacts ready for the 3D wing</h2>
                  <p className="mx-auto mb-8 max-w-2xl text-[var(--text-secondary)]">
                    Add memories to exhibition rooms and this gallery will install them as framed artifacts.
                  </p>
                  <Button variant="primary" onClick={() => navigate("/collections")}>
                    <Plus size={18} />
                    Add Artifacts
                  </Button>
                </div>
              )}

              {!isLoading && !error && memories.length > 0 && !hasEntered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-lg border border-[var(--gold-primary)]/25 bg-[#06070a] px-8 py-20 text-center"
                  style={{ boxShadow: "0 34px 110px rgba(0,0,0,0.62)" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(212,175,55,0.22),transparent_34%),linear-gradient(90deg,rgba(212,175,55,0.08),transparent,rgba(212,175,55,0.08))]" />
                  <div className="relative z-10 mx-auto max-w-3xl">
                    <Cuboid size={56} className="mx-auto mb-6 text-[var(--gold-primary)]" />
                    <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--gold-secondary)]">
                      Flagship 3D Wing
                    </p>
                    <h2 className="text-5xl mb-5 text-[var(--gold-primary)]">Enter 3D Museum</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
                      Step into a noir-and-gold exhibition room where your real memories become framed artifacts in a navigable 3D museum.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Button variant="primary" size="lg" onClick={() => setHasEntered(true)}>
                        <DoorOpen size={20} />
                        Enter 3D Museum
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/gallery")}>
                        <ArrowLeft size={20} />
                        Back to Gallery
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isLoading && !error && memories.length > 0 && hasEntered && (
                <>
                  {currentRoom && (
                    <motion.div
                      key={currentRoom.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 rounded-lg border border-[var(--gold-primary)]/25 bg-[var(--surface)] p-5"
                    >
                      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                            Exhibition Room {roomIndex + 1} / {rooms.length}
                          </p>
                          <h2 className="text-3xl text-[var(--gold-primary)]">{currentRoom.title}</h2>
                          <p className="mt-3 max-w-3xl leading-relaxed text-[var(--text-secondary)]">
                            {currentRoom.curatorNote}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                          <Button variant="outline" onClick={() => navigate("/gallery")}>
                            <ArrowLeft size={18} />
                            Exit to Gallery
                          </Button>
                          <Button variant="outline" onClick={startTour} disabled={installedMemories.length === 0}>
                            <Eye size={18} />
                            Start Tour
                          </Button>
                          <Button variant="outline" onClick={goToPreviousRoom} disabled={rooms.length <= 1}>
                            <ChevronLeft size={18} />
                            Previous Room
                          </Button>
                          <Button variant="primary" onClick={goToNextRoom} disabled={rooms.length <= 1}>
                            Next Room
                            <ChevronRight size={18} />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                        <label className="block">
                          <span className="mb-2 block text-sm text-[var(--text-primary)]">Exhibition Room</span>
                          <select
                            value={currentRoom.id}
                            onChange={(event) => {
                              const nextIndex = rooms.findIndex((room) => room.id === event.target.value);
                              if (nextIndex >= 0) changeRoom(nextIndex);
                            }}
                            className="w-full border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--gold-primary)]"
                          >
                            {rooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.title} ({room.memories.length})
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex items-end">
                          <Button variant="secondary" onClick={goToNextRoom} disabled={rooms.length <= 1} className="w-full">
                            <DoorOpen size={18} />
                            Enter Next Room
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="mb-4 rounded-lg border border-[var(--gold-primary)]/25 bg-[var(--surface)] p-4 md:hidden">
                    <div className="flex items-start gap-3">
                      <Monitor size={22} className="mt-1 text-[var(--gold-primary)]" />
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                        The 3D Museum is best on desktop. A simplified artifact list is shown here for mobile.
                      </p>
                    </div>
                  </div>

                  <div
                    className="hidden h-[calc(100vh-220px)] min-h-[620px] overflow-hidden rounded-lg border border-[var(--gold-primary)]/20 bg-black md:block"
                    style={{ boxShadow: "0 34px 110px rgba(0,0,0,0.62)" }}
                  >
                    <div className="relative h-full">
                      <Canvas
                        camera={{ position: [0, 2.5, 6.5], fov: 52 }}
                        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
                        shadows
                      >
                        <MuseumRoom
                          key={currentRoom?.id}
                          roomTitle={currentRoom?.title ?? "3D Museum"}
                          memories={installedMemories}
                          activeFrameIndex={tourIndex}
                          onSelectMemory={setSelectedMemory}
                        />
                      </Canvas>
                      <motion.div
                        initial={false}
                        animate={{ opacity: isRoomTransitioning ? 1 : 0 }}
                        className="pointer-events-none absolute inset-0 bg-black"
                        transition={{ duration: 0.18 }}
                      />
                      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--gold-primary)]/35 bg-black/55 px-4 py-2 text-sm text-[var(--gold-secondary)] backdrop-blur">
                        <DoorOpen size={16} />
                        <span>
                          {currentRoom && currentRoom.memories.length > MAX_3D_FRAMES
                            ? `Showing ${MAX_3D_FRAMES} of ${currentRoom.memories.length} artifacts for performance`
                            : rooms.length > 1
                              ? "Use Enter Next Room to pass through the gold arch"
                              : "Add more rooms to expand the 3D museum"}
                        </span>
                      </div>
                      {installedMemories.length === 0 && (
                        <div className="absolute left-1/2 top-6 w-[min(90%,520px)] -translate-x-1/2 rounded-lg border border-[var(--gold-primary)]/30 bg-black/70 p-4 text-center backdrop-blur">
                          <p className="text-[var(--gold-primary)]">This exhibition room has no memory artifacts installed yet.</p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Move to another room or add memories to this collection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(currentRoom?.memories.length ?? 0) === 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center md:hidden">
                      <Images size={30} className="mx-auto mb-3 text-[var(--gold-primary)]" />
                      <p className="text-[var(--text-secondary)]">This exhibition room has no memory artifacts yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:hidden">
                      {(currentRoom?.memories ?? []).map((memory) => (
                      <button
                        key={memory.id}
                        type="button"
                        onClick={() => setSelectedMemory(memory)}
                        className="flex items-center gap-4 border border-[var(--border)] bg-[var(--surface)] p-3 text-left"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[var(--surface-light)]">
                          {memory.image_url ? (
                            <img src={memory.image_url} alt={memory.title} className="h-full w-full object-cover" />
                          ) : (
                            <Images size={26} className="text-[var(--gold-primary)]/60" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[var(--text-primary)]">{memory.title}</h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatDate(memory.memory_date)}</p>
                        </div>
                      </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>
      </div>

      {selectedMemory && (
        <MemoryOverlay
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onViewFull={() => navigate(`/memory/${selectedMemory.id}`)}
        />
      )}

      {tourMemory && (
        <Guided3DTourOverlay
          memory={tourMemory}
          currentStep={tourIndex === null ? 1 : tourIndex + 1}
          totalSteps={installedMemories.length}
          onPrevious={goToPreviousArtifact}
          onNext={goToNextArtifact}
          onEnd={() => setTourIndex(null)}
          onViewFull={() => navigate(`/memory/${tourMemory.id}`)}
        />
      )}
    </div>
  );
}

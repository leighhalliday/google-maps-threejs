import Link from "next/link";

export default function App() {
  return (
    <ul>
      <li>
        <Link href="/car">ThreeJS Car</Link>
      </li>
      <li>
        <Link href="/intro">ThreeJS Intro</Link>
      </li>
      <li>
        <Link href="/markers">Advanced Markers</Link>
      </li>
    </ul>
  );
}

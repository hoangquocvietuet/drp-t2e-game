import { useCallback, useEffect, useState } from 'react';
import './App.css'; // Ensure this imports Tailwind CSS
import { DRP, DRPObject } from '@ts-drp/object';
import { DRPNode } from '@ts-drp/node';
import { GameDRP } from "./DRP";

interface Info {
  peerId: string;
  bootstraps: string[];
  peers: string[];
}

interface Leaderboard {
  user: string;
  points: number;
}

function App() {
  const [drp, setDrp] = useState<DRP>();
  const [privateKey, setPrivateKey] = useState<string>();
  const [node, setNode] = useState<DRPNode>();
  const [info, setInfo] = useState<Info>();
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [numUsers, setNumUsers] = useState(0);
  const [topPoints, setTopPoints] = useState<Leaderboard[]>([]);

  const handleTap = () => {
    if (!drp || !node) return;
    (drp as GameDRP).tap(node.networkNode.peerId);
  }

  useEffect(() => {
		const interval = setInterval(() => {
      if (!node) return;
      setInfo({
        peerId: node.networkNode.peerId,
        bootstraps: node.networkNode.getBootstrapNodes(),
        peers: node.networkNode.getAllPeers()
      });
		}, 1000);
		return () => clearInterval(interval);
	});

  useEffect(() => {
    const interval = setInterval(() => {
      if (!drp || !node) return;
      setPoints((drp as GameDRP).query_points(node.networkNode.peerId) || 0);
      setEnergy((drp as GameDRP).query_energy(node.networkNode.peerId) || 0);
      setNumUsers((drp as GameDRP).query_numUsers());
      setTopPoints((drp as GameDRP).query_top10Points());
      console.log(node.objectStore.get("game")?.vertices.length, node.objectStore.get("game")?.vertices.filter(v => v.operation?.opType === "addUser"));
    }, 1000);
    return () => clearInterval(interval);
  }, [drp, node, setEnergy, setPoints]);

  const newGameObject = useCallback(async(): Promise<DRPObject | undefined> => {
      const drpObject = await node?.createObject({
        drp: new GameDRP(),
        id: "game",
        sync: {
          enabled: true,
        }
      })
      return drpObject;
  }, [node]);

  useEffect(() => {
    async function init() {
      if (!node) return;
      let gameDRPObject = node.objectStore.get("game");
      if (!gameDRPObject) {
        gameDRPObject = await newGameObject();
      }
      const drp = gameDRPObject?.drp as GameDRP;
      drp.addUser(node.networkNode.peerId);
      setDrp(drp);
    }
    init();
  }, [node, newGameObject]);

  const handleStart = async () => {
    if (!privateKey) return;
    const node = new DRPNode({
      credential_config: {
        private_key_seed: privateKey
      },
      network_config: {
        private_key_seed: privateKey,
        pubsub_peer_discovery_interval: 100
      }
    });
    await node.start();
    setNode(node);
    setInfo({
      peerId: node.networkNode.peerId,
      bootstraps: node.networkNode.getBootstrapNodes(),
      peers: node.networkNode.getAllPeers()
    });
  }

  return (
    <div className="flex items-center justify-center bg-gray-100">
      {
        !node && <div className="text-center h-[500px] w-[500px]">
          <div className="text-2xl font-semibold mb-4">T2E Game built on top of DRP</div>
          <input className="mt-4 px-4 py-2 bg-gray-200 text-black rounded" placeholder="Enter your private key" onChange={(e) => setPrivateKey(e.target.value)} />
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      }
      {
        node && drp && <div className="text-center h-[500px] w-[500px]">
          <div className="text-2xl font-semibold mb-4">T2E Game built on top of DRP</div>
          <div className="text-lg text-black p-2">Your peerId: {info?.peerId}</div>
          <div className="text-lg text-black p-2">Bootstrap: {info?.bootstraps}</div>
          {
            info?.peers.map((peerId, index) => (
              <div key={index} className="text-lg text-black p-2">Peer {index + 1}: {peerId}</div>
            ))
          }
          <div className="text-lg text-black p-2">Number users {numUsers}</div>
          <div className="text-lg text-black p-2">Your points: {points}</div>
          <div className="text-lg text-black p-2">Your energy: {energy}</div>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
            onClick={handleTap}
          >
            Tap
          </button>
          {
            topPoints.length > 0 && <div className="text-center h-[500px] w-[500px]">
              <div className="text-2xl font-semibold mb-4">Leaderboard</div>
              {
                topPoints.map((leader, index) => (
                  <div key={index} className="text-lg text-black p-2">{leader.user}: {leader.points}</div>
                ))
              }
            </div>
          }
        </div>
      }
    </div>
  );
}

export default App;

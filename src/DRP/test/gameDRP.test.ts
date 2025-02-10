import { DRPObject } from "@ts-drp/object";
import { beforeAll, vi , describe, expect, test } from "vitest";
import { GameDRP } from "..";

describe("Game DRP Testcases", () => {
    let obj1: DRPObject;
    let obj2: DRPObject;
    const baseDate = new Date(2000, 1, 1, 0);

    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(baseDate)

        const drp = new GameDRP();

        obj1 = new DRPObject({
            peerId: "peer1",
            drp: drp,
            publicCredential: {
                ed25519PublicKey: "peer1",
                blsPublicKey: "peer1",
            }
        });

        obj2 = new DRPObject({
            peerId: "peer2",
            drp: drp,
            publicCredential: {
                ed25519PublicKey: "peer2",
                blsPublicKey: "peer2",
            }
        });
    });

    test("Add users", () => {
        vi.setSystemTime(baseDate);
        (obj1.drp as GameDRP).addUser("peer1");
        (obj2.drp as GameDRP).addUser("peer2");
    
        obj1.merge(obj2.hashGraph.getAllVertices());
        obj2.merge(obj1.hashGraph.getAllVertices());

        expect((obj1.drp as GameDRP).query_numUsers()).toBe(2);
        expect((obj2.drp as GameDRP).query_numUsers()).toBe(2);
    });

    test("Tap", () => {
        vi.setSystemTime(baseDate);
        (obj1.drp as GameDRP).tap("peer1");
        (obj2.drp as GameDRP).tap("peer2");

        obj1.merge(obj2.hashGraph.getAllVertices());
        obj2.merge(obj1.hashGraph.getAllVertices());

        (obj1.drp as GameDRP).tap("peer1");
        (obj1.drp as GameDRP).tap("peer1");
        (obj1.drp as GameDRP).tap("peer1");
        (obj2.drp as GameDRP).tap("peer2");

        obj1.merge(obj2.hashGraph.getAllVertices());
        obj2.merge(obj1.hashGraph.getAllVertices());

        expect((obj1.drp as GameDRP).query_points("peer1")).toBe(4);
        expect((obj2.drp as GameDRP).query_points("peer2")).toBe(2);
    });

    test("Submit Online Prove", () => {
        vi.setSystemTime(baseDate);
        (obj1.drp as GameDRP).submitOnlineProve("peer1");
        (obj2.drp as GameDRP).submitOnlineProve("peer2");

        expect((obj1.drp as GameDRP).query_energy("peer1")).toBe(96);
        expect((obj2.drp as GameDRP).query_energy("peer2")).toBe(99);
    });
});
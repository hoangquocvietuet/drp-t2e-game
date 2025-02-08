import { ActionType, DRP, ResolveConflictsType, SemanticsType, Vertex } from "@ts-drp/object";

export class GameDRP implements DRP {
    semanticsType: SemanticsType = SemanticsType.pair;
    resolveConflicts(_: Vertex[]): ResolveConflictsType {
		return { action: ActionType.Nop };
	}

    points: Map<string, number> = new Map();
    energy: Map<string, number> = new Map();
    lastSeen: Map<string, number> = new Map();

    addUser(user: string) {
        this.points.set(user, 0);
        this.energy.set(user, 100);
        this.lastSeen.set(user, Date.now());
    }

    tap(user: string) {
        const points = this.points.get(user);
        if (points === undefined) {
            return;
        }

        const energy = this.energy.get(user);
        const timestamp = Date.now();
        if (energy) {
            console.log("energy", user, energy);
            this.energy.set(user, energy - 1);
            this.points.set(user, points + 1);
            this.lastSeen.set(user, timestamp);
        } else {
            const lastSeen = this.lastSeen.get(user);
            if (lastSeen) {
                const diff = (timestamp - lastSeen) / 1000;
                if (diff) {
                    this.energy.set(user, Math.min(99, diff));
                    this.points.set(user, points + 1);
                    this.lastSeen.set(user, timestamp);
                }
            }
        }
    }

    submitOnlineProve(user: string) {
        const energy = this.energy.get(user);
        if (energy === undefined) {
            return;
        }
        const lastSeen = this.lastSeen.get(user);
        const timestamp = Date.now();
        if (lastSeen && timestamp - lastSeen > 10000) {
            return;
        }
        this.lastSeen.set(user, timestamp);
        this.energy.set(user, energy + 1);
    }

    query_points(user: string) {
        return this.points.get(user);
    }

    query_energy(user: string) {
        const energy = this.energy.get(user);
        const lastSeen = this.lastSeen.get(user);
        if (lastSeen && energy) {
            console.log("energy", energy);
            const diff = (Date.now() - lastSeen) / 1000;
            this.energy.set(user, Math.min(100, energy + diff));
            return this.energy.get(user);
        }
        return undefined;
    }

    query_numUsers() {
        return this.points.size;
    }
}


import { ActionType, DRP, ResolveConflictsType, SemanticsType, Vertex } from "@ts-drp/object";

export class GameDRP implements DRP {
    semanticsType: SemanticsType = SemanticsType.pair;
    resolveConflicts(vertices: Vertex[]): ResolveConflictsType {
		if (vertices.length !== 2) return {
            action: ActionType.Nop
        }
        if (vertices[0].operation?.opType !== "addUser") {
            return {
                action: ActionType.Nop
            }
        }
        if (vertices[0].operation?.value !== vertices[1].operation?.value) {
            return {
                action: ActionType.Nop
            }
        }
        if (vertices[0].timestamp < vertices[1].timestamp) {
            return {
                action: ActionType.DropRight,
            }
        }
        return {
            action: ActionType.DropLeft,
        }
	}

    points: Map<string, number> = new Map();
    energy: Map<string, number> = new Map();
    lastSeen: Map<string, number> = new Map();

    addUser(user: string) {
        if (this.points.has(user)) {
            return;
        }
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
        const now = Date.now();
        if (energy) {
            this.energy.set(user, energy - 1);
            this.points.set(user, points + 1);
            this.lastSeen.set(user, now);
        } else {
            const lastSeen = this.lastSeen.get(user);
            if (lastSeen) {
                const diff = Math.floor((now - lastSeen) / 10000);
                if (diff) {
                    this.energy.set(user, Math.min(99, diff));
                    this.points.set(user, points + 1);
                    this.lastSeen.set(user, now);
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
        const now = Date.now();
        if (lastSeen && energy) {
            const diff = Math.floor((now - lastSeen) / 10000);
            this.energy.set(user, Math.min(100, energy + diff));
            if (diff) this.lastSeen.set(user, now);
            return this.energy.get(user);
        }
        return undefined;
    }

    query_numUsers() {
        return this.points.size;
    }

    query_top10Points() {
        const sorted = Array.from(this.points.entries()).sort((a, b) => b[1] - a[1]);
        return sorted.slice(0, 10).map(([user, points]) => ({ user, points }));
    }
}


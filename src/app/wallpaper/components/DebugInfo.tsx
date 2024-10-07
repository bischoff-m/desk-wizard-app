import { useEffect, useRef, useState } from "react";
import { DisplayTimings } from "../types";
import { ProgramState } from "../classes/state/ProgramState";

const MOVING_AVERAGE_MS = 2000;
const UPDATE_INTERVAL_MS = 100;

export default function DebugInfo(props: { sharedState: ProgramState }) {
    const { sharedState } = props;
    const [timings, setTimings] = useState<DisplayTimings & { didDropFrames: boolean }>({
        ...sharedState.getTimings(),
        didDropFrames: false,
    });
    const allTimings = useRef<DisplayTimings[]>([]);
    const interval = useRef<NodeJS.Timeout>();

    useEffect(() => {
        function updateListener() {
            allTimings.current.unshift(sharedState.getTimings());
        }

        sharedState.addUpdateListener(updateListener);
        interval.current = setInterval(() => {
            if (!sharedState.animationSettings.animate) {
                setTimings({
                    ...sharedState.getTimings(),
                    didDropFrames: false,
                });
                return;
            }
            // Remove timings outside of moving average window
            allTimings.current = allTimings.current.filter(
                (timing) => timing.timestamp >= performance.now() - MOVING_AVERAGE_MS
            );
            // Calculate average timings
            const acc = allTimings.current.reduce<
                DisplayTimings & { didDropFrames: boolean }
            >(
                (acc, timing) => {
                    acc.fps += timing.fps;
                    acc.totalDelta += timing.totalDelta;
                    acc.stateDelta += timing.stateDelta;
                    acc.controlDelta += timing.controlDelta;
                    if (timing.totalDelta < timing.stateDelta + timing.controlDelta)
                        acc.didDropFrames = true;
                    return acc;
                },
                {
                    timestamp: performance.now(),
                    fps: 0,
                    totalDelta: 0,
                    stateDelta: 0,
                    controlDelta: 0,
                    didDropFrames: false,
                }
            );
            acc.fps /= allTimings.current.length;
            acc.totalDelta /= allTimings.current.length;
            acc.stateDelta /= allTimings.current.length;
            acc.controlDelta /= allTimings.current.length;
            setTimings(acc);
        }, UPDATE_INTERVAL_MS);

        return () => {
            sharedState.removeUpdateListener(updateListener);
            clearInterval(interval.current);
        };
    }, [sharedState]);

    return (
        <div className="absolute top-0 left-0 bg-opacity-50 bg-slate-900 p-3 text-white z-50">
            <div className="grid grid-cols-[auto_1fr] gap-x-2 [&>*:nth-child(odd)]:text-slate-300">
                <div>FPS</div>
                <div>{timings.fps.toFixed(0)}</div>
                <div>Total</div>
                <div>{timings.totalDelta.toFixed(3)} ms</div>
                <div>State</div>
                <div>{timings.stateDelta.toFixed(3)} ms</div>
                <div>Control</div>
                <div>{timings.controlDelta.toFixed(3)} ms</div>
                {timings.didDropFrames && (
                    <div className="col-span-2">
                        <span className="text-red-500">Dropping frames</span>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useCallback } from 'react';
import { StorageItem, ItemType } from '../types';
import { generateRandomId } from '../gameConfig';

export function useGacha() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState<StorageItem | null>(null);
    const [isNewDiscovery, setIsNewDiscovery] = useState(false);

    const performDraw = useCallback((onResult: (result: StorageItem) => void) => {
        setIsDrawing(true);
        setTimeout(() => {
            const pool: ItemType[] = ['score', 'number', 'timer', 'refresh'];
            const type = pool[Math.floor(Math.random() * pool.length)];
            const result: StorageItem = {
                id: generateRandomId(),
                type,
                value: type === 'number' ? Math.floor(Math.random() * 9) + 1 : undefined
            };
            const storageKey = `seen_item_${type}`;
            const hasSeen = localStorage.getItem(storageKey);
            if (!hasSeen) { setIsNewDiscovery(true); localStorage.setItem(storageKey, 'true'); }
            else { setIsNewDiscovery(false); }
            onResult(result);
            setDrawResult(result);
            setIsDrawing(false);
        }, 1500);
    }, []);

    const claimReward = useCallback(() => {
        setIsOpen(false);
        setDrawResult(null);
        setIsNewDiscovery(false);
    }, []);

    return { isOpen, setIsOpen, isDrawing, drawResult, isNewDiscovery, performDraw, claimReward };
}

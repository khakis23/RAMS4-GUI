import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useConfigurationStore } from '@/store/useConfigurationStore';
import { useMechanicalTestStore } from '@/store/useMechanicalTestStore';
import { useValidationStore } from '@/store/useConfigurationStore';
import { Button } from '@/components/ui/button';
import { Sliders, Plus, Save, FileJson, Check } from 'lucide-react';
import { useFormAutoSave } from '../configuration/hooks/useFormAutoSave';
import { MechTestCardItem } from './components/MechTestCardItem';
import { MechTestGroupItem } from './components/MechTestGroupItem';
import { zodResolver } from '@hookform/resolvers/zod';
import { mechTestFormSchema } from './profileSchemas/mechTestSchema';
import { z } from 'zod';

const getReadableFieldName = (fieldName: string) => {
    if (fieldName === 'profileID') return 'Image Profile';
    if (fieldName === 'imgMode') return 'Image Mode';
    if (fieldName === 'dispToggle') return 'Time/Velocity Toggle';
    if (!fieldName) return 'Value';
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ');
};

const compileMechTestErrors = (error: z.ZodError) => {
    const errorList: string[] = [];
    error.issues.forEach(issue => {
        const path = issue.path;
        if (path[0] !== 'cards') return;
        
        let errorMsg = '';
        const rootIndex = path[1] as number;
        
        if (path.length === 4) {
            const field = getReadableFieldName(path[3] as string);
            errorMsg = `Step #${rootIndex + 1} > ${field}: ${issue.message}`;
        } else if (path.length === 7) {
            const childIndex = path[4] as number;
            const field = getReadableFieldName(path[6] as string);
            errorMsg = `Group #${rootIndex + 1} > Step #${childIndex + 1} > ${field}: ${issue.message}`;
        } else if (path.length === 10) {
            const childIndex = path[4] as number;
            const subChildIndex = path[7] as number;
            const field = getReadableFieldName(path[9] as string);
            errorMsg = `Group #${rootIndex + 1} > Sub-Group #${childIndex + 1} > Step #${subChildIndex + 1} > ${field}: ${issue.message}`;
        } else {
            errorMsg = `Sequence Error: ${issue.message}`;
        }
        
        errorList.push(errorMsg);
    });
    return errorList;
};

const MechanicalTestInner = () => {
    const { draft } = useConfigurationStore();
    const {
        cards,
        isDirty,
        isLoading,
        loadMechTest,
        saveMechTest,
        setCards,
        resetStore,
        lastLoadedPath
    } = useMechanicalTestStore();

    const configDirectory = draft?.configDirectory;
    const experimentNumber = draft?.experimentNumber;

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalErrors, setModalErrors] = useState<string[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // React Hook Form initialization with Zod Resolver
    const { register, control, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(mechTestFormSchema),
        mode: "onChange",
        defaultValues: {
            cards: cards
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "cards"
    });

    const lastLoading = useRef<boolean>(false);
    const loadedPathRef = useRef<string>("");
    const currentPathKey = `${configDirectory}-${experimentNumber}`;

    // Sync form values into store draft state on every change
    const watchedValues = watch();

    // Reset RHF only when path changes or a gateway load completes
    useEffect(() => {
        const loadingFinished = lastLoading.current && !isLoading;
        const pathChanged = currentPathKey !== loadedPathRef.current;

        if (loadingFinished || pathChanged) {
            loadedPathRef.current = currentPathKey;
            reset({ cards });
        }
        lastLoading.current = isLoading;
    }, [cards, isLoading, currentPathKey, reset]);

    useFormAutoSave({
        watchedValues,
        storeDraft: { cards },
        updateDraft: (data: any) => {
            setCards(data.cards || []);
        },
        mapValues: (watched: any) => ({
            cards: watched.cards || []
        })
    });

    // Validate sequence continuously and sync to validation store
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const result = mechTestFormSchema.safeParse(watchedValues);
        if (!result.success) {
            const errorStrings = compileMechTestErrors(result.error);
            const existingErrors = useValidationStore.getState().errors['sequence'] || [];
            const hasChanged = 
                existingErrors.length !== errorStrings.length ||
                errorStrings.some((msg: string, idx: number) => msg !== existingErrors[idx]);
            
            if (hasChanged) {
                setErrors('sequence', errorStrings);
            }
        } else {
            const existingErrors = useValidationStore.getState().errors['sequence'] || [];
            if (existingErrors.length > 0) {
                setErrors('sequence', []);
            }
        }
    }, [watchedValues, setErrors]);

    // Load mechanical test when config directory or experiment changes
    useEffect(() => {
        if (configDirectory && experimentNumber) {
            const currentKey = `${configDirectory}::${experimentNumber}`;
            if (lastLoadedPath !== currentKey) {
                loadMechTest(configDirectory, experimentNumber);
            }
        } else {
            resetStore();
        }
    }, [configDirectory, experimentNumber, lastLoadedPath, loadMechTest, resetStore]);

    const handleSave = async () => {
        if (configDirectory && experimentNumber) {
            // Trigger zod validation check
            const result = mechTestFormSchema.safeParse(watchedValues);
            if (!result.success) {
                const errorStrings = compileMechTestErrors(result.error);
                setModalErrors(errorStrings);
                setShowErrorModal(true);
                return;
            }

            try {
                await saveMechTest(configDirectory, experimentNumber);
            } catch (err) {
                console.error("Failed to save mechanical test:", err);
            }
        }
    };

    // HTML5 Drag and Drop Handlers
    const handleDragStart = (index: number, e: React.DragEvent) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        move(draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (!configDirectory || !experimentNumber) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-mauve-200 rounded-sm p-8 text-center bg-mauve-50/10 max-w-4xl mx-auto my-12">
                <div className="h-12 w-12 rounded-full bg-mauve-100 flex items-center justify-center mb-4">
                    <Sliders className="h-6 w-6 text-mauve-650" />
                </div>
                <h3 className="text-base font-bold text-mauve-850">Configuration Required</h3>
                <p className="text-sm text-mauve-600 max-w-sm mt-2 leading-relaxed">
                    Please select a Cycle, Station, BTR, Sample, and Experiment in the <strong>Configure</strong> tab before building or loading mechanical tests.
                </p>
            </div>
        );
    }

    return (
        <form className="flex flex-col h-full max-w-5xl mx-auto flex-1 min-h-0">
            {/* Top Toolbar Header (Always Visible) */}
            <div className="flex items-center justify-between pb-3 border-b border-mauve-200 shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xs font-bold text-mauve-850 flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-mauve-650" />
                        Test Sequence Builder
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Add Step Button */}
                    <Button
                        type="button"
                        onClick={() => append({
                            id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: 'ramp',
                            data: {}
                        })}
                        className="h-8 px-4 text-xs font-semibold rounded-lg bg-mauve-600 hover:bg-mauve-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in animate-duration-200"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Step
                    </Button>

                    {/* Add Group Button */}
                    <Button
                        type="button"
                        onClick={() => append({
                            id: `card-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: 'group',
                            data: { cards: [] }
                        })}
                        className="h-8 px-4 text-xs font-semibold rounded-lg bg-white border border-mauve-300 hover:bg-mauve-50 text-mauve-850 flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in animate-duration-200"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Group
                    </Button>

                    {/* Save Button */}
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="h-8 px-4 text-xs font-semibold rounded-lg bg-white border border-mauve-300 hover:bg-mauve-50 text-mauve-850 disabled:opacity-50 disabled:bg-mauve-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                        {isDirty ? (
                            <Save className="h-3.5 w-3.5" />
                        ) : (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                        )}
                        Save Test Sequence
                    </Button>
                </div>
            </div>

            {/* Scrollable Cards Container */}
            <div className="flex-grow overflow-y-auto py-6 min-h-0">
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] border border-mauve-200 rounded-sm p-8 text-center bg-white">
                        <p className="text-sm text-mauve-500">
                            No steps added to this test yet.
                        </p>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => append({
                                id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                type: 'ramp',
                                data: {}
                            })}
                            className="mt-2 text-xs font-semibold text-mauve-650 hover:text-mauve-850 cursor-pointer text-decoration-none"
                        >
                            Click here to add a new step.
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {fields.map((field, index) => {
                            const namePrefix = `cards.${index}`;
                            const cardField = field as any;
                            const cardId = watch(`${namePrefix}.id` as any) as string;
                            if (cardField.type === 'group') {
                                return (
                                    <MechTestGroupItem
                                        key={field.id}
                                        index={index}
                                        namePrefix={namePrefix}
                                        depth={1}
                                        register={register}
                                        errors={errors}
                                        control={control}
                                        watch={watch}
                                        setValue={setValue}
                                        removeCard={remove}
                                        onDragStart={(e) => handleDragStart(index, e)}
                                        onDragOver={(e) => handleDragOver(index, e)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedIndex === index}
                                    />
                                );
                            } else {
                                return (
                                    <MechTestCardItem
                                        key={field.id}
                                        index={index}
                                        namePrefix={namePrefix}
                                        register={register}
                                        errors={errors}
                                        control={control}
                                        watch={watch}
                                        setValue={setValue}
                                        removeCard={remove}
                                        onDragStart={(e) => handleDragStart(index, e)}
                                        onDragOver={(e) => handleDragOver(index, e)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedIndex === index}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </div>

            {/* Save Validation Error Modal */}
            <WarningModal
                isOpen={showErrorModal}
                title="Cannot Save Mechanical Test"
                description="Please resolve all validation errors in your test sequence before saving."
                confirmText="OK"
                cancelText=""
                onConfirm={() => setShowErrorModal(false)}
                onCancel={() => setShowErrorModal(false)}
            >
                <div className="bg-red-50/50 border border-red-100 rounded-sm p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                    <span className="text-xs font-bold text-red-800">Please fix the following fields:</span>
                    <ul className="list-disc list-inside text-xs text-red-700 space-y-1.5 pl-1">
                        {modalErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            </WarningModal>
        </form>
    );
};
export const MechanicalTestBuilder = () => {
    const _hasHydrated = useMechanicalTestStore(state => state._hasHydrated);

    if (!_hasHydrated) {
        return (
            <div className="flex-1 flex flex-col p-6 min-h-[400px] justify-center items-center">
                <p className="text-gray-500 font-semibold">Loading test sequence...</p>
            </div>
        );
    }

    return <MechanicalTestInner />;
};

interface WarningModalProps {
    isOpen: boolean;
    title: string;
    titleColorClass?: string;
    description: string | React.ReactNode;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

const WarningModal = ({
    isOpen,
    title,
    titleColorClass = "text-destructive",
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    children
}: WarningModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-md p-6 max-w-md w-full shadow-2xl border border-mauve-150 flex flex-col gap-4 text-left animate-in fade-in zoom-in duration-200">
                <div className={`flex items-center gap-2.5 font-bold text-lg ${titleColorClass}`}>
                    <span>{title}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                </p>
                {children}
                <div className="flex gap-3 justify-end mt-2">
                    {cancelText && (
                        <Button variant="secondary" onClick={onCancel} type="button">
                            {cancelText}
                        </Button>
                    )}
                    <Button variant="destructive" onClick={onConfirm} type="button">
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

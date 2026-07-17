import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { TabSettings } from '../../feature/configuration/TabSettings.tsx';
import { useConfigurationStore, useValidationStore } from '../../store/useConfigurationStore.ts';
import { postSettingsToGateway } from '../../api/configApi.ts';
import { Button } from '../../components/ui/button.tsx';
import { Checkbox } from '../../components/ui/checkbox.tsx';

interface SettingsMenuProps {
    onClose: () => void;
}

export const SettingsMenu = ({ onClose }: SettingsMenuProps) => {
    const { draft, updateDraft, savedConfig, setSavedConfig } = useConfigurationStore();
    const { errors: validationErrors } = useValidationStore();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const hasErrors = (validationErrors['settings'] || []).length > 0;

    const isDirty = useMemo(() => {
        if (!savedConfig) return false;
        const keys = [
            'specHost', 'requireSpecEnable', 'systemName', 'controllerHost', 'axisCount', 'taskCount', 'axesSettings', 'signalSettings'
        ] as const;
        return keys.some(key => JSON.stringify(draft[key]) !== JSON.stringify(savedConfig[key]));
    }, [draft, savedConfig]);

    const performSave = async () => {
        if (!draft.configDirectory) {
            alert("No configuration directory selected. Settings could not be saved to cycle path.");
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                specHost: draft.specHost,
                requireSpecEnable: draft.requireSpecEnable,
                systemName: draft.systemName,
                controllerHost: draft.controllerHost,
                axisCount: draft.axisCount,
                taskCount: draft.taskCount,
                axesSettings: draft.axesSettings,
                signalSettings: draft.signalSettings
            };
            const res = await postSettingsToGateway(draft.configDirectory, payload);
            if (res.success) {
                updateDraft({
                    settingsVersion: res.version,
                    ...payload
                });
                setSavedConfig({
                    ...savedConfig,
                    ...payload,
                    settingsVersion: res.version
                } as any);
                useConfigurationStore.getState().setSettingsFallbackActive(null);
            }
        } catch (err) {
            console.error("Failed to save settings on close", err);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    const handleCloseAttempt = async () => {
        if (!isDirty) {
            onClose();
            return;
        }

        if (hasErrors) {
            alert("Cannot save settings: Please resolve validation errors before closing.");
            return;
        }

        const isDismissed = sessionStorage.getItem('dismissSettingsWarning') === 'true';
        if (isDismissed) {
            await performSave();
        } else {
            setShowWarningModal(true);
        }
    };

    const handleConfirmProceed = async () => {
        setShowWarningModal(false);
        await performSave();
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSaving) handleCloseAttempt();
            }}
        >
            <div
                className="w-full max-w-4xl h-[85vh] bg-white rounded-md p-8 flex flex-col shadow-2xl relative border border-mauve-200 overflow-hidden text-left"
            >
                {/* Close Button */}
                <button
                    onClick={handleCloseAttempt}
                    disabled={isSaving}
                    className="absolute top-6 right-6 p-2 rounded-full text-mauve-600 hover:bg-mauve-100 hover:text-mauve-800 transition-all duration-200 cursor-pointer z-10 disabled:opacity-50"
                    aria-label="Close Settings"
                >
                    <X className="w-5 h-5 shrink-0" />
                </button>

                {/* Form Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto pr-3 mr-[-12px] sleek-scrollbar">
                    <TabSettings />
                </div>
            </div>

            {/* Advanced Settings Warning Dialog */}
            <WarningModal
                isOpen={showWarningModal}
                title="Advanced Action Required"
                description={
                    <>Changing settings is an <strong>advanced feature</strong>. Modifying these configurations will globally change settings for all future users of this station.</>
                }
                confirmText="Proceed"
                cancelText="Cancel"
                onConfirm={handleConfirmProceed}
                onCancel={() => setShowWarningModal(false)}
            />
        </div>
    );
};

// Reusable Warning Modal Sub-component
interface WarningModalProps {
    isOpen: boolean;
    title: string;
    titleColorClass?: string;
    description: string | React.ReactNode;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const WarningModal = ({
    isOpen,
    title,
    titleColorClass = "text-destructive",
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel
}: WarningModalProps) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}>
            <div 
                className="bg-white rounded-md p-6 max-w-md w-full shadow-2xl border border-mauve-150 flex flex-col gap-4 text-left animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center gap-2.5 font-bold text-lg ${titleColorClass}`}>
                    <span>{title}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                        id="dontShowSettingsAgain"
                        checked={dontShowAgain}
                        onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                        className="border-mauve-300 data-checked:bg-mauve-600 data-checked:border-mauve-600 data-checked:text-white focus-visible:ring-mauve-400"
                    />
                    <label htmlFor="dontShowSettingsAgain" className="text-xs text-gray-550 font-medium select-none cursor-pointer">
                        Don't show warning again for this session
                    </label>
                </div>

                <div className="flex gap-3 justify-end mt-2">
                    {cancelText && (
                        <Button variant="secondary" onClick={onCancel}>
                            {cancelText}
                        </Button>
                    )}
                    <Button 
                        variant="destructive" 
                        onClick={() => {
                            if (dontShowAgain) {
                                sessionStorage.setItem('dismissSettingsWarning', 'true');
                            }
                            onConfirm();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
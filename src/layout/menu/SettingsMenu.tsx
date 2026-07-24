import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { TabSettings } from '../../feature/configuration/TabSettings.tsx';
import { useConfigurationStore, useValidationStore } from '../../store/useConfigurationStore.ts';
import { postSettingsToGateway } from '../../api/configApi.ts';
import { WarningModal } from '../../components/ui/WarningModal.tsx';

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

    const handleDiscardChanges = () => {
        setShowWarningModal(false);
        if (savedConfig) {
            updateDraft({
                specHost: savedConfig.specHost,
                requireSpecEnable: savedConfig.requireSpecEnable,
                systemName: savedConfig.systemName,
                controllerHost: savedConfig.controllerHost,
                axisCount: savedConfig.axisCount,
                taskCount: savedConfig.taskCount,
                axesSettings: savedConfig.axesSettings,
                signalSettings: savedConfig.signalSettings,
                settingsVersion: savedConfig.settingsVersion,
            });
        }
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSaving) handleCloseAttempt();
            }}
        >
            <div
                className="w-full max-w-4xl h-[85vh] bg-white rounded-md p-8 flex flex-col shadow-2xl relative border border-mauve-200  overflow-hidden text-left"
            >
                {/* Close Button with Backdrop Blur & Fade Pill */}
                <button
                    onClick={handleCloseAttempt}
                    disabled={isSaving}
                    className="absolute top-6 right-6 p-2 rounded-full text-mauve-600 hover:bg-mauve-500/30 hover:text-mauve-900 dark:hover:bg-orange-400/30 dark:text-orange-400 dark:hover:text-orange-300 bg-white/30 dark:bg-mauve-900/30 backdrop-blur-md border border-mauve-200 shadow-smdark:hover:bg-mauve-700/50 transition-all duration-200 cursor-pointer z-10 disabled:opacity-50"
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
                confirmText="Save Changes"
                discardText="Discard Changes"
                cancelText="Cancel"
                onConfirm={handleConfirmProceed}
                onDiscard={handleDiscardChanges}
                onCancel={() => setShowWarningModal(false)}
            />
        </div>
    );
};
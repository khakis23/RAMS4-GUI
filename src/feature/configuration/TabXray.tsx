import React from 'react';
import { DynamicForm } from "../../components/DynamicForm.tsx";
import { xraySchema } from "./profileSchemas/xraySchema.ts";
import { useXrayStore } from "../../store/configuration/useXrayStore.ts";
import { ConfigTabSection } from "../../layout/parital/ConfigTabSection.tsx";


export const TabXray = () => {
    const { xrayProfile, setXrayProfile } = useXrayStore();

    return (
        <ConfigTabSection
            title="X-ray Scan Profiles"
            description="Create and save different X-ray scan profiles.">

            <DynamicForm
                schema={xraySchema}
                data={xrayProfile}
                onChange={setXrayProfile}
                layout='horizontal'
            />
            <p className='text-xs font-small text-mauve-800'>* Required</p>
        </ConfigTabSection>
    )
}

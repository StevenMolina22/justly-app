import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateDispute } from "@/hooks/actions/useCreateDispute";
import { uploadFileToIPFS } from "@/util/ipfs";
import type { CreateDisputeForm, FileState } from "@/components/create";

export const useCreateDisputeForm = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { createDispute, isCreating } = useCreateDispute();

    const [isUploading, setIsUploading] = useState(false);

    // --- FORM STATE ---
    const [formData, setFormData] = useState<CreateDisputeForm>({
        title: "",
        category: "General",
        jurorsRequired: 3,
        deadlineHours: 96,
        claimerName: "",
        claimerAddress: "",
        defenderName: "",
        defenderAddress: "",
        description: "",
        evidenceLink: "",
        defDescription: "",
    });

    // --- FILE STATE ---
    const [files, setFiles] = useState<FileState>({
        audio: null,
        carousel: [],
        defAudio: null,
        defCarousel: [],
    });

    // --- HANDLERS ---
    const updateField = (
        field: keyof CreateDisputeForm,
        value: string | number,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (formData.jurorsRequired % 2 === 0) {
            toast.error("Please select an odd number of jurors.");
            return;
        }

        try {
            setIsUploading(true);

            // Collect all upload tasks with type identifiers
            type UploadTask = { type: string; file: File; index?: number };
            const uploadTasks: UploadTask[] = [];

            if (files.audio) {
                uploadTasks.push({ type: "audio", file: files.audio });
            }

            files.carousel.forEach((f, i) => {
                uploadTasks.push({ type: "carousel", file: f, index: i });
            });

            if (files.defAudio) {
                uploadTasks.push({ type: "defAudio", file: files.defAudio });
            }

            files.defCarousel.forEach((f, i) => {
                uploadTasks.push({ type: "defCarousel", file: f, index: i });
            });

            // Execute all uploads in parallel (eliminates sequential waterfall)
            if (uploadTasks.length > 0) {
                toast.info(`Uploading ${uploadTasks.length} file${uploadTasks.length > 1 ? "s" : ""}...`);
                
                const uploadResults = await Promise.all(
                    uploadTasks.map(async (task) => ({
                        ...task,
                        hash: await uploadFileToIPFS(task.file),
                    }))
                );

                // Process results by type
                const audioResult = uploadResults.find((r) => r.type === "audio");
                const audioUrl = audioResult?.hash
                    ? `https://gateway.pinata.cloud/ipfs/${audioResult.hash}`
                    : "";

                const carouselUrls = uploadResults
                    .filter((r) => r.type === "carousel" && r.hash)
                    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                    .map((r) => `https://gateway.pinata.cloud/ipfs/${r.hash}`);

                const defAudioResult = uploadResults.find((r) => r.type === "defAudio");
                const defAudioUrl = defAudioResult?.hash
                    ? `https://gateway.pinata.cloud/ipfs/${defAudioResult.hash}`
                    : null;

                const defCarouselUrls = uploadResults
                    .filter((r) => r.type === "defCarousel" && r.hash)
                    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                    .map((r) => `https://gateway.pinata.cloud/ipfs/${r.hash}`);

                // 3. Construct Payload
                const disputePayload = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    evidence: formData.evidenceLink ? [formData.evidenceLink] : [],
                    aliases: {
                        claimer: formData.claimerName || "Anonymous Claimant",
                        defender: formData.defenderName || "Anonymous Defendant",
                    },
                    audioEvidence: audioUrl || null,
                    carouselEvidence: carouselUrls,
                    defenderDescription: formData.defDescription || null,
                    defenderAudioEvidence: defAudioUrl,
                    defenderCarouselEvidence: defCarouselUrls,
                    created_at: new Date().toISOString(),
                };

                const success = await createDispute(
                    formData.defenderAddress,
                    formData.claimerAddress || undefined,
                    formData.category,
                    disputePayload,
                    formData.jurorsRequired,
                    formData.deadlineHours,
                );

                if (success) {
                    await queryClient.invalidateQueries({ queryKey: ["disputeCount"] });
                    router.push("/profile");
                }
            } else {
                // No files to upload, proceed directly
                const disputePayload = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    evidence: formData.evidenceLink ? [formData.evidenceLink] : [],
                    aliases: {
                        claimer: formData.claimerName || "Anonymous Claimant",
                        defender: formData.defenderName || "Anonymous Defendant",
                    },
                    audioEvidence: null,
                    carouselEvidence: [],
                    defenderDescription: formData.defDescription || null,
                    defenderAudioEvidence: null,
                    defenderCarouselEvidence: [],
                    created_at: new Date().toISOString(),
                };

                const success = await createDispute(
                    formData.defenderAddress,
                    formData.claimerAddress || undefined,
                    formData.category,
                    disputePayload,
                    formData.jurorsRequired,
                    formData.deadlineHours,
                );

                if (success) {
                    await queryClient.invalidateQueries({ queryKey: ["disputeCount"] });
                    router.push("/profile");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload evidence.");
        } finally {
            setIsUploading(false);
        }
    };

    const isProcessing = isCreating || isUploading;

    return {
        formData,
        files,
        setFiles,
        updateField,
        submit,
        isProcessing,
    };
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
};

export default function ConfirmLogoutModal({
    visible,
    onCancel,
    onConfirm,
    loading = false,
}: Props) {
    const { t } = useTranslation();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <View className="flex-1 bg-black/40 items-center justify-center px-6">
                <View className="w-full max-w-md rounded-3xl bg-white p-6">
                    <Text className="text-xl font-bold text-[#111827]">
                        {t('app.logout.title')}
                    </Text>
                    <Text className="text-sm text-[#6B7280] mt-2">
                        {t('app.logout.message')}
                    </Text>

                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity
                            className="flex-1 rounded-xl border border-gray-200 py-3 items-center"
                            onPress={onCancel}
                            disabled={loading}
                        >
                            <Text className="text-[#374151] font-semibold">
                                {t('app.logout.cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 rounded-xl py-3 items-center bg-[#c91d12]"
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            <Text className="text-white font-semibold">
                                {t('app.logout.logout')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

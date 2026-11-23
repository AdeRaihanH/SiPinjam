import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import { registerDialogHandler } from '../lib/dialog';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => registerDialogHandler((payload) => {
    setBusy(false);
    setDialog(payload);
  }), []);

  function close() {
    if (busy) return;
    setDialog(null);
  }

  async function approve() {
    if (busy || !dialog) return;
    if (dialog.mode === 'alert') {
      setDialog(null);
      return;
    }

    setBusy(true);
    try {
      await dialog.onConfirm?.();
    } catch {
      // Layar pemanggil menampilkan pesan error di halaman aslinya.
    } finally {
      setBusy(false);
      setDialog(null);
    }
  }

  const destructive = Boolean(dialog?.destructive);
  const isAlert = dialog?.mode === 'alert';

  return (
    <>
      {children}
      <Modal
        visible={Boolean(dialog)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.root} accessibilityViewIsModal>
          <Pressable
            style={styles.backdrop}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Tutup dialog"
          />
          <View style={styles.card}>
            <View style={[styles.icon, destructive && styles.iconDanger]}>
              <Ionicons
                name={isAlert ? 'information-circle-outline' : destructive ? 'alert-circle-outline' : 'help-circle-outline'}
                size={23}
                color={destructive ? colors.danger : colors.primary}
              />
            </View>

            <View style={styles.copy}>
              <Text style={styles.title}>{dialog?.title}</Text>
              {dialog?.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
            </View>

            <View style={styles.actions}>
              {!isAlert ? (
                <Button
                  title={dialog?.cancelLabel || 'Batal'}
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onPress={close}
                  style={styles.button}
                />
              ) : null}
              <Button
                title={busy ? 'Memproses...' : dialog?.confirmLabel || 'Mengerti'}
                variant={destructive ? 'danger' : 'primary'}
                size="sm"
                loading={busy}
                onPress={approve}
                style={styles.button}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 22,
    gap: 14,
    ...shadows.lift,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: { backgroundColor: colors.dangerSoft },
  copy: { gap: 5 },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.4,
  },
  message: {
    fontSize: type.xs,
    lineHeight: 19,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 2,
  },
  button: { flex: 1 },
});

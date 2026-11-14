import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import { Pill } from '../components/Pill';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import { Skeleton } from '../components/Skeleton';
import StackHeader from '../components/StackHeader';
import ToolGlyph from '../components/ToolGlyph';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows, text, toneForCategory } from '../theme';
import {
  formatRupiah,
  labelKondisi,
} from '../utils/format';
import { toToolQr } from '../utils/scan';

function InfoStat({ label, value, tone = colors.ink, last = false }) {
  return (
    <View style={[styles.infoStat, !last && styles.infoStatBorder]}>
      <Text style={[styles.infoValue, { color: tone }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

export default function DetailAlatScreen({ navigation, route }) {
  const { toolId, tool: initialTool } = route.params || {};
  const insets = useSafeAreaInsets();

  const loadTool = useCallback(() => api.get(`/tools/${toolId}`), [toolId]);
  const toolRes = useResource(loadTool, { initialData: initialTool || null });

  const loadStats = useCallback(() => api.get('/stats/summary'), []);
  const statsRes = useResource(loadStats);

  const tool = toolRes.data;
  const stats = statsRes.data;
  const tone = toneForCategory(tool?.kategori_slug);
  const stok = Number(tool?.stok_tersedia ?? 0);
  const dipinjamSendiri = Boolean(tool?.dipinjam_oleh_saya);
  const adaKeterlambatan = Number(stats?.terlambat || 0) > 0;

  const onRefresh = () => {
    toolRes.reload('refresh');
    statsRes.reload('silent');
  };

  let ctaLabel = 'Pinjam alat';
  let ctaIcon = 'arrow-forward';
  let ctaDisabled = false;
  let ctaAction = () => navigation.navigate('FormPinjam', { tool });

  if (dipinjamSendiri) {
    ctaLabel = 'Sedang kamu pinjam';
    ctaIcon = 'checkmark-circle-outline';
    ctaDisabled = true;
  } else if (stok <= 0) {
    ctaLabel = 'Stok habis';
    ctaIcon = 'close-circle-outline';
    ctaDisabled = true;
  } else if (adaKeterlambatan) {
    ctaLabel = 'Selesaikan pinjaman dulu';
    ctaIcon = 'time-outline';
    ctaAction = () => navigation.navigate('Pinjaman');
  }

  return (
    <Screen padded={false}>
      <StackHeader
        title="Detail alat"
        subtitle={tool?.kode || 'Memuat...'}
      />

      {toolRes.loading && !tool ? (
        <View style={styles.loading}>
          <Skeleton height={210} radius={22} />
          <Skeleton height={86} radius={18} />
          <Skeleton height={140} radius={18} />
        </View>
      ) : toolRes.error && !tool ? (
        <ErrorState error={toolRes.error} onRetry={() => toolRes.reload('refresh')} />
      ) : tool ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            refreshControl={(
              <RefreshControl
                refreshing={toolRes.refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            )}
          >
            {adaKeterlambatan ? (
              <InlineNotice
                tone="danger"
                title="Ada pinjaman terlambat"
                message="Kembalikan pinjaman yang terlambat sebelum meminjam alat baru."
                actionLabel="Buka pinjaman"
                onAction={() => navigation.navigate('Pinjaman')}
              />
            ) : null}

            {dipinjamSendiri ? (
              <InlineNotice
                tone="info"
                title="Sedang kamu pinjam"
                message="Alat ini masih ada di pinjaman aktifmu. Kembalikan dulu sebelum meminjam lagi."
                actionLabel="Lihat pinjaman"
                onAction={() => navigation.navigate('Pinjaman')}
              />
            ) : null}

            <View style={[styles.hero, { backgroundColor: tone.bg }]}>
              <View style={[styles.heroRing, { borderColor: tone.fg }]} pointerEvents="none" />
              <View style={styles.heroTop}>
                <Pill
                  label={tool.kategori_nama}
                  tone="neutral"
                  style={styles.categoryPill}
                />
                <Pill
                  label={labelKondisi(tool.kondisi)}
                  tone={tool.kondisi === 'baik' ? 'primary' : 'warn'}
                />
              </View>
              <View style={styles.glyphWrap}>
                <ToolGlyph tool={tool} size={82} style={styles.glyph} />
              </View>
              <Text style={styles.heroTitle}>{tool.nama}</Text>
              <Text style={styles.heroSub}>Kode alat {tool.kode}</Text>
            </View>

            <View style={styles.infoCard}>
              <InfoStat
                label="Tersedia"
                value={`${stok} unit`}
                tone={stok > 0 ? colors.primaryDark : colors.danger}
              />
              <InfoStat label="Total unit" value={`${tool.stok_total} unit`} />
              <InfoStat
                label="Kondisi"
                value={labelKondisi(tool.kondisi)}
                tone={tool.kondisi === 'baik' ? colors.ink : colors.warn}
                last
              />
            </View>

            <View style={styles.section}>
              <SectionTitle title="Tentang alat" />
              <Text style={styles.description}>
                {tool.deskripsi || 'Belum ada deskripsi untuk alat ini.'}
              </Text>
            </View>

            <View style={styles.section}>
              <SectionTitle title="QR alat" subtitle="Tempel atau tunjukkan saat memindai" />
              <QRCodeCard
                value={toToolQr(tool.kode)}
                code={tool.kode}
                label="Pindai QR ini di tab Scan untuk membuka alat"
                size={132}
                style={styles.qrCard}
              />
            </View>

            <InlineNotice
              tone="info"
              icon="information-circle"
              title="Aturan peminjaman"
              message={`Maksimal 3 alat per transaksi, durasi 1–3 hari, dan denda ${formatRupiah(stats?.denda_per_hari || 2000)} per hari keterlambatan.`}
            />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.priceWrap}>
              <Text style={styles.priceLabel}>Biaya pinjam</Text>
              <Text style={styles.priceValue}>Gratis</Text>
              <Text style={styles.priceHint}>
                Denda {formatRupiah(stats?.denda_per_hari || 2000)}/hari
              </Text>
            </View>
            <Button
              title={ctaLabel}
              icon={ctaIcon}
              disabled={ctaDisabled}
              onPress={ctaAction}
              style={styles.cta}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  loading: {
    paddingHorizontal: 20,
    gap: 12,
  },
  hero: {
    borderRadius: radius.xl,
    padding: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    opacity: 0.14,
    right: -70,
    top: -80,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  categoryPill: {
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  glyphWrap: {
    marginTop: 16,
    marginBottom: 14,
  },
  glyph: {
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  heroSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    ...shadows.soft,
  },
  infoStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  infoStatBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoLabel: {
    fontSize: 9.5,
    color: colors.muted,
  },
  section: { gap: 8 },
  description: {
    ...text.body,
    color: colors.body,
  },
  qrCard: {
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...shadows.sheet,
    shadowOpacity: 0.06,
  },
  priceWrap: { width: 92, gap: 0 },
  priceLabel: { fontSize: 9.5, color: colors.muted },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  priceHint: { fontSize: 8.5, color: colors.faint },
  cta: { flex: 1 },
});

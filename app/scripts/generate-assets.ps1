# Membuat aset ikon SiPinjam tanpa dependensi desain eksternal.
# Jalankan dari folder app: powershell -ExecutionPolicy Bypass -File scripts/generate-assets.ps1
Add-Type -AssemblyName System.Drawing

$assets = Join-Path $PSScriptRoot '..\assets'
$assets = [System.IO.Path]::GetFullPath($assets)
New-Item -ItemType Directory -Force $assets | Out-Null

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Canvas([int]$size, [bool]$transparent) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($transparent) {
    $g.Clear([System.Drawing.Color]::Transparent)
  }
  return @($bmp, $g)
}

function Draw-Finder($g, [float]$x, [float]$y, [float]$size, [float]$thick, $color) {
  $pen = New-Object System.Drawing.Pen($color, $thick)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawRectangle($pen, $x, $y, $size, $size)
  $inner = $size * 0.42
  $brush = New-Object System.Drawing.SolidBrush($color)
  $g.FillRectangle($brush, $x + ($size - $inner) / 2, $y + ($size - $inner) / 2, $inner, $inner)
  $pen.Dispose()
  $brush.Dispose()
}

function Draw-Mark($g, [int]$size, [float]$cardRatio, [bool]$withCard) {
  $card = $size * $cardRatio
  $cardX = ($size - $card) / 2
  $cardY = ($size - $card) / 2
  if ($withCard) {
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $circlePath = New-RoundedPath $cardX $cardY $card $card ($card * 0.22)
    $g.FillPath($white, $circlePath)
    $circlePath.Dispose()
    $white.Dispose()
  }

  $teal = [System.Drawing.Color]::FromArgb(255, 10, 91, 75)
  $accent = [System.Drawing.Color]::FromArgb(255, 242, 178, 63)
  $pad = $card * 0.155
  $f = $card * 0.235
  $thick = [Math]::Max(3, $card * 0.052)
  $left = $cardX + $pad
  $top = $cardY + $pad
  $right = $cardX + $card - $pad - $f
  $bottom = $cardY + $card - $pad - $f

  Draw-Finder $g $left $top $f $thick $teal
  Draw-Finder $g $right $top $f $thick $teal
  Draw-Finder $g $left $bottom $f $thick $teal

  $unit = $card * 0.058
  $gap = $card * 0.026
  $bx = $cardX + $card - $pad - ($unit * 3) - ($gap * 2)
  $by = $cardY + $card - $pad - $unit
  $tealBrush = New-Object System.Drawing.SolidBrush($teal)
  $accentBrush = New-Object System.Drawing.SolidBrush($accent)
  $g.FillRectangle($tealBrush, $bx, $by - $unit - $gap, $unit, $unit)
  $g.FillRectangle($tealBrush, $bx + $unit + $gap, $by - $unit - $gap, $unit, $unit)
  $g.FillRectangle($tealBrush, $bx, $by, $unit, $unit)
  $g.FillRectangle($accentBrush, $bx + $unit + $gap, $by, $unit, $unit)
  $tealBrush.Dispose()
  $accentBrush.Dispose()
}

# ---------- icon.png ----------
$size = 1024
$pair = New-Canvas $size $false
$bmp = $pair[0]; $g = $pair[1]
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $rect,
  [System.Drawing.Color]::FromArgb(255, 14, 124, 102),
  [System.Drawing.Color]::FromArgb(255, 7, 63, 52),
  45
)
$g.FillRectangle($gradient, $rect)
$gradient.Dispose()
$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 255, 255, 255), 8)
$g.DrawEllipse($ringPen, $size * 0.62, -$size * 0.18, $size * 0.62, $size * 0.62)
$g.DrawEllipse($ringPen, -$size * 0.2, $size * 0.75, $size * 0.5, $size * 0.5)
$ringPen.Dispose()
Draw-Mark $g $size 0.54 $true
$bmp.Save((Join-Path $assets 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ---------- adaptive foreground ----------
$pair = New-Canvas $size $true
$bmp = $pair[0]; $g = $pair[1]
Draw-Mark $g $size 0.52 $true
$bmp.Save((Join-Path $assets 'android-icon-foreground.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ---------- monochrome foreground ----------
# Android memakai alpha mask untuk themed icon. Karena itu gambar hanya
# berisi tanda QR putih di atas transparan, bukan kartu putih penuh.
$pair = New-Canvas $size $true
$bmp = $pair[0]; $g = $pair[1]
$white = [System.Drawing.Color]::White
$box = $size * 0.62
$boxX = ($size - $box) / 2
$boxY = ($size - $box) / 2
$pad = $box * 0.03
$f = $box * 0.26
$thick = [Math]::Max(4, $box * 0.06)
Draw-Finder $g ($boxX + $pad) ($boxY + $pad) $f $thick $white
Draw-Finder $g ($boxX + $box - $pad - $f) ($boxY + $pad) $f $thick $white
Draw-Finder $g ($boxX + $pad) ($boxY + $box - $pad - $f) $f $thick $white
$unit = $box * 0.075
$gap = $box * 0.035
$bx = $boxX + $box - $pad - ($unit * 3) - ($gap * 2)
$by = $boxY + $box - $pad - $unit
$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$g.FillRectangle($whiteBrush, $bx, $by - $unit - $gap, $unit, $unit)
$g.FillRectangle($whiteBrush, $bx + $unit + $gap, $by - $unit - $gap, $unit, $unit)
$g.FillRectangle($whiteBrush, $bx, $by, $unit, $unit)
$g.FillRectangle($whiteBrush, $bx + $unit + $gap, $by, $unit, $unit)
$whiteBrush.Dispose()
$bmp.Save((Join-Path $assets 'android-icon-monochrome.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ---------- splash icon ----------
$splashSize = 512
$pair = New-Canvas $splashSize $true
$bmp = $pair[0]; $g = $pair[1]
Draw-Mark $g $splashSize 0.7 $true
$bmp.Save((Join-Path $assets 'splash-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ---------- favicon ----------
$favSize = 64
$pair = New-Canvas $favSize $false
$bmp = $pair[0]; $g = $pair[1]
$g.Clear([System.Drawing.Color]::FromArgb(255, 10, 91, 75))
Draw-Mark $g $favSize 0.72 $true
$bmp.Save((Join-Path $assets 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

Write-Output "Aset dibuat di $assets"

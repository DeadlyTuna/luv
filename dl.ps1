$urls = @{
  "paris.jpg" = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"
  "santorini.jpg" = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&q=80&w=800"
  "venice.jpg" = "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&q=80&w=800"
  "kyoto.jpg" = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800"
  "maldives.jpg" = "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800"
  "machupicchu.jpg" = "https://images.unsplash.com/photo-1526392060635-9d60198d3de3?auto=format&fit=crop&q=80&w=800"
  "newyork.jpg" = "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800"
  "dubai.jpg" = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800"
  "bali.jpg" = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800"
  "swissalps.jpg" = "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800"
  "prague.jpg" = "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80&w=800"
  "amalfi.jpg" = "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
  "queenstown.jpg" = "https://images.unsplash.com/photo-1600208449175-6e54ee6fb7fe?auto=format&fit=crop&q=80&w=800"
  "rio.jpg" = "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800"
  "mumbai.jpg" = "https://images.unsplash.com/photo-1529253355956-fbf3ee226879?auto=format&fit=crop&q=80&w=800"
  "havana.jpg" = "https://images.unsplash.com/photo-1506161821034-ac47b2520626?auto=format&fit=crop&q=80&w=800"
  "banff.jpg" = "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=800"
  "iceland.jpg" = "https://images.unsplash.com/photo-1476610286381-bd3915ce6fb1?auto=format&fit=crop&q=80&w=800"
  "capetown.jpg" = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=800"
  "istanbul.jpg" = "https://images.unsplash.com/photo-1524385158607-e17fb25be2e5?auto=format&fit=crop&q=80&w=800"
}

New-Item -ItemType Directory -Force -Path "d:\Projects\misci\photos\destinations"

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

foreach ($key in $urls.Keys) {
  $file = "d:\Projects\misci\photos\destinations\$key"
  
  if (-Not (Test-Path $file) -or (Get-Item $file).length -eq 0) {
    Write-Host "Downloading $key..."
    $success = $false
    $retries = 0
    while (-not $success -and $retries -lt 3) {
      try {
        Invoke-WebRequest -Uri $urls[$key] -OutFile $file -ErrorAction Stop
        $success = $true
      } catch {
        $retries++
        Write-Host "Failed. Retrying $retries..."
        Start-Sleep -Seconds 2
      }
    }
  } else {
    Write-Host "$key already exists, skipping."
  }
}
Write-Host "All downloads complete."

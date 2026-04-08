$urls = @{
  "santorini.jpg" = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&q=80&w=800"
  "machupicchu.jpg" = "https://images.unsplash.com/photo-1526392060635-9d60198d3de3?auto=format&fit=crop&q=80&w=800"
  "queenstown.jpg" = "https://images.unsplash.com/photo-1600208449175-6e54ee6fb7fe?auto=format&fit=crop&q=80&w=800"
  "mumbai.jpg" = "https://images.unsplash.com/photo-1529253355956-fbf3ee226879?auto=format&fit=crop&q=80&w=800"
  "havana.jpg" = "https://images.unsplash.com/photo-1506161821034-ac47b2520626?auto=format&fit=crop&q=80&w=800"
  "iceland.jpg" = "https://images.unsplash.com/photo-1476610286381-bd3915ce6fb1?auto=format&fit=crop&q=80&w=800"
  "istanbul.jpg" = "https://images.unsplash.com/photo-1524385158607-e17fb25be2e5?auto=format&fit=crop&q=80&w=800"
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
}

foreach ($key in $urls.Keys) {
  $file = "d:\Projects\misci\photos\destinations\$key"
  
  if (-Not (Test-Path $file) -or (Get-Item $file).length -eq 0) {
    Write-Host "Downloading $key..."
    try {
      Invoke-WebRequest -Uri $urls[$key] -OutFile $file -Headers $headers -ErrorAction Stop
      Write-Host "Success!"
    } catch {
      Write-Host "Failed: $($_.Exception.Message)"
    }
  } else {
    Write-Host "$key already exists, skipping."
  }
}
Write-Host "All downloads complete."

# Ouvrir utils/compasswatch.bat

# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "../"
css_dir = "../www/css"
sass_dir = "../sass"
images_dir = "../www/img"
fonts_dir = "../www/css/fonts"
javascripts_dir = "../www/js"
generated_images_dir = "../www/img"
#dossier sprite avec les images à générer en sprite
sprite_load_path = "../sprites/"

#environment = :production
#environment = :developpement

enable_sourcemaps = true

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

#
# Pour inspecter les sources Sass dans la console de chrome :
# chrome://flags/ => Activer les expérimentations dans les outils de développement
# dans les settings de la console Experiments=>Support for Sass
if environment == :production
  output_style = :compressed
else
  output_style = :expanded
end

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false


# Réaliser une copie des sprites avec un nom dépourvu du hash d'unicité.
on_sprite_saved do |filename|
  if File.exists?(filename)
    FileUtils.cp filename, filename.gsub(%r{-s[a-z0-9]{10}\.png$}, '.png')
    FileUtils.rm_rf(filename)
  end
end

# Remplacer dans les feuilles de styles générés les références aux sprites par
# leurs équivalents dépourvus du hash d'unicité.
on_stylesheet_saved do |filename|
  if File.exists?(filename)
    css = File.read filename
    File.open(filename, 'w+') do |f|
      f << css.gsub(%r{-s[a-z0-9]{10}\.png}, '.png')
    end
  end
end
# Generated by Django 5.1.6 on 2025-03-25 11:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('suzaku', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PostEquipo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField()),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='equipo_posts/')),
                ('orden', models.PositiveIntegerField(default=0, help_text='Posición para mostrar el post en el equipo.')),
            ],
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='direccion',
        ),
    ]

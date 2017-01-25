﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using static SOPeL.Infrastructure.Enums;

namespace SOPeL.Models
{
    [Table("Rezerwacje")]
    public class Rezerwacja
    {
        public Rezerwacja()
        {
            Stat = Status.Rezerwacja;
        }

        [ScaffoldColumn(false)]
        public int Id { get; set; }

        [DataType(DataType.Date)]
        [Display(Name = "Data")]
        public DateTime DataRezerwacji { get; set; }

        [Display(Name = "Godzina od")]
        public string godzOd { get; set; }

        [Display(Name = "Godzina do")]
        public string godzDo { get; set; }

        [Display(Name = "Data ost. mod.")]
        [DisplayFormat(DataFormatString = "{0:dd-MMM-yyyy}", ApplyFormatInEditMode = true)]
        public DateTime DataModyfikacji { get; set; }

        public Status Stat { get; set; }
        public Aktywny Aktw { get; set; }


        public int PracownikID { get; set; }
        public int PacjentID { get; set; }

        public virtual Pracownik Pracownik { get; set; }
        public virtual Pacjent Pacjent { get; set; }

    }
}
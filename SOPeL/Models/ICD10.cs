﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SOPeL.Models
{
    public class ICD10
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }

        [Display(Name = "Kod")]
        public string Kod { get; set; }

        [Display(Name = "Nazwa")]
        public string Nazwa { get; set; }
    }
}